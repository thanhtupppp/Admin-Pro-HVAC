import { db } from './firebaseConfig';
import {
    collection,
    doc,
    getDocs,
    addDoc,
    updateDoc,
    query,
    where,
    orderBy,
    Unsubscribe,
    onSnapshot
} from 'firebase/firestore';
import { Claim } from '../types/claim';
import {
    FraudAlert,
    FraudStats,
    DuplicateClaim,
    AnomalyScore,
    FraudAlertType,
    FraudReason
} from '../types/fraud';

/**
 * Fraud Detection Service
 * AI-powered fraud detection và pattern recognition
 */
export const fraudService = {
    /**
     * Analyze claim for fraud indicators
     */
    analyzeClaim: async (claim: Claim, historicalClaims: Claim[]): Promise<AnomalyScore> => {
        const factors: any[] = [];
        let totalScore = 0;

        // 1. Check unusual amount
        const avgAmount = historicalClaims.length > 0
            ? historicalClaims.reduce((sum, c) => sum + c.amount, 0) / historicalClaims.length
            : 0;

        if (claim.amount > avgAmount * 3) {
            const amountScore = Math.min(((claim.amount / avgAmount) - 3) * 20, 40);
            factors.push({
                name: 'Số tiền bất thường',
                score: amountScore,
                description: 'Số tiền cao hơn 3 lần trung bình',
                evidence: [`Số tiền: ${claim.amount.toLocaleString('vi-VN')}đ`, `Trung bình: ${avgAmount.toLocaleString('vi-VN')}đ`]
            });
            totalScore += amountScore;
        }

        // 2. Check duplicate submissions
        const duplicates = await fraudService.findDuplicateClaims(claim);
        if (duplicates.length > 0) {
            const dupScore = Math.min(duplicates.length * 30, 50);
            factors.push({
                name: 'Claims trùng lặp',
                score: dupScore,
                description: `Phát hiện ${duplicates.length} claims tương tự`,
                evidence: duplicates.map(d => `Claim ${d.claimId2}: ${d.similarity}% giống nhau`)
            });
            totalScore += dupScore;
        }

        // 3. Check frequency (nhiều claims trong thời gian ngắn)
        const recentClaims = historicalClaims.filter(c => {
            const daysDiff = (new Date().getTime() - new Date(c.createdAt).getTime()) / (1000 * 60 * 60 * 24);
            return c.customerId === claim.customerId && daysDiff <= 30;
        });

        if (recentClaims.length >= 3) {
            const freqScore = Math.min((recentClaims.length - 2) * 15, 30);
            factors.push({
                name: 'Tần suất cao',
                score: freqScore,
                description: `${recentClaims.length} claims trong 30 ngày`,
                evidence: [`Khách hàng: ${claim.customerName}`]
            });
            totalScore += freqScore;
        }

        // 4. Time-based anomaly (submitted at unusual hours)
        if (claim.submittedAt) {
            const hour = new Date(claim.submittedAt).getHours();
            if (hour < 6 || hour > 22) {
                factors.push({
                    name: 'Thời gian bất thường',
                    score: 10,
                    description: 'Gửi ngoài giờ làm việc',
                    evidence: [`Giờ gửi: ${hour}:00`]
                });
                totalScore += 10;
            }
        }

        // Normalize score to 0-100
        const normalizedScore = Math.min(totalScore, 100);

        // Recommendation based on score
        let recommendation: 'approve' | 'review' | 'reject' = 'approve';
        if (normalizedScore >= 70) recommendation = 'reject';
        else if (normalizedScore >= 40) recommendation = 'review';

        return {
            claimId: claim.id,
            overallScore: normalizedScore,
            factors,
            recommendation
        };
    },

    /**
     * Find duplicate claims
     */
    findDuplicateClaims: async (claim: Claim): Promise<DuplicateClaim[]> => {
        try {
            const q = query(
                collection(db, 'claims'),
                where('customerId', '==', claim.customerId)
            );
            const snapshot = await getDocs(q);
            const duplicates: DuplicateClaim[] = [];

            snapshot.forEach((docSnap) => {
                const otherClaim = { id: docSnap.id, ...docSnap.data() } as Claim;

                if (otherClaim.id === claim.id) return; // Skip self

                // Calculate similarity
                const similarity = fraudService.calculateSimilarity(claim, otherClaim);

                if (similarity > 70) { // 70% threshold
                    const timeDiff = Math.abs(
                        new Date(claim.createdAt).getTime() - new Date(otherClaim.createdAt).getTime()
                    ) / (1000 * 60 * 60);

                    duplicates.push({
                        claimId1: claim.id,
                        claimId2: otherClaim.id,
                        similarity,
                        matchingFields: fraudService.getMatchingFields(claim, otherClaim),
                        timeDifference: timeDiff
                    });
                }
            });

            return duplicates;
        } catch (error) {
            console.error('Failed to find duplicates:', error);
            return [];
        }
    },

    /**
     * Calculate similarity between two claims
     */
    calculateSimilarity: (claim1: Claim, claim2: Claim): number => {
        let matches = 0;
        let total = 0;

        // Compare fields
        const fieldsToCompare = ['type', 'category', 'amount', 'description'];

        fieldsToCompare.forEach(field => {
            total++;
            const val1 = (claim1 as any)[field];
            const val2 = (claim2 as any)[field];

            if (field === 'amount') {
                // Amount within 10% is considered match
                if (Math.abs(val1 - val2) / val1 < 0.1) matches++;
            } else if (field === 'description') {
                // Text similarity (simple)
                const similarity = fraudService.textSimilarity(val1, val2);
                if (similarity > 0.7) matches++;
            } else {
                if (val1 === val2) matches++;
            }
        });

        return (matches / total) * 100;
    },

    /**
     * Simple text similarity (Jaccard index)
     */
    textSimilarity: (text1: string, text2: string): number => {
        const words1 = new Set(text1.toLowerCase().split(/\s+/));
        const words2 = new Set(text2.toLowerCase().split(/\s+/));

        const intersection = new Set([...words1].filter(w => words2.has(w)));
        const union = new Set([...words1, ...words2]);

        return intersection.size / union.size;
    },

    /**
     * Get matching fields between claims
     */
    getMatchingFields: (claim1: Claim, claim2: Claim): string[] => {
        const matching: string[] = [];

        if (claim1.type === claim2.type) matching.push('type');
        if (claim1.category === claim2.category) matching.push('category');
        if (Math.abs(claim1.amount - claim2.amount) / claim1.amount < 0.1) matching.push('amount');
        if (fraudService.textSimilarity(claim1.description, claim2.description) > 0.7) {
            matching.push('description');
        }

        return matching;
    },

    /**
     * Create fraud alert
     */
    createAlert: async (
        claimId: string,
        claimNumber: string,
        alertType: FraudAlertType,
        riskScore: number,
        reasons: FraudReason[]
    ): Promise<FraudAlert> => {
        const severity = fraudService.calculateSeverity(riskScore);

        const alert: Omit<FraudAlert, 'id'> = {
            claimId,
            claimNumber,
            alertType,
            riskScore,
            severity,
            reasons,
            status: 'open',
            detectedAt: new Date().toISOString(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        const docRef = await addDoc(collection(db, 'fraudAlerts'), alert);
        return { id: docRef.id, ...alert } as FraudAlert;
    },

    /**
     * Calculate alert severity
     */
    calculateSeverity: (riskScore: number): 'low' | 'medium' | 'high' | 'critical' => {
        if (riskScore >= 80) return 'critical';
        if (riskScore >= 60) return 'high';
        if (riskScore >= 40) return 'medium';
        return 'low';
    },

    /**
     * Get all fraud alerts
     */
    getAlerts: async (filters?: { status?: string }): Promise<FraudAlert[]> => {
        try {
            let q = query(collection(db, 'fraudAlerts'), orderBy('detectedAt', 'desc'));

            if (filters?.status) {
                q = query(q, where('status', '==', filters.status));
            }

            const snapshot = await getDocs(q);
            const alerts: FraudAlert[] = [];

            snapshot.forEach((doc) => {
                alerts.push({ id: doc.id, ...doc.data() } as FraudAlert);
            });

            return alerts;
        } catch (error) {
            console.error('Failed to get alerts:', error);
            return [];
        }
    },

    /**
     * Update alert status
     */
    updateAlert: async (alertId: string, updates: Partial<FraudAlert>): Promise<void> => {
        const docRef = doc(db, 'fraudAlerts', alertId);
        await updateDoc(docRef, {
            ...updates,
            updatedAt: new Date().toISOString()
        });
    },

    /**
     * Get fraud statistics
     */
    getStats: async (): Promise<FraudStats> => {
        try {
            const alerts = await fraudService.getAlerts();

            const stats: FraudStats = {
                totalAlerts: alerts.length,
                openAlerts: alerts.filter(a => a.status === 'open').length,
                confirmedFraud: alerts.filter(a => a.status === 'confirmed').length,
                falsePositives: alerts.filter(a => a.status === 'false_positive').length,
                averageRiskScore: alerts.length > 0
                    ? alerts.reduce((sum, a) => sum + a.riskScore, 0) / alerts.length
                    : 0,
                alertsBySeverity: {
                    low: alerts.filter(a => a.severity === 'low').length,
                    medium: alerts.filter(a => a.severity === 'medium').length,
                    high: alerts.filter(a => a.severity === 'high').length,
                    critical: alerts.filter(a => a.severity === 'critical').length
                },
                alertsByType: {
                    duplicate_claim: alerts.filter(a => a.alertType === 'duplicate_claim').length,
                    unusual_amount: alerts.filter(a => a.alertType === 'unusual_amount').length,
                    frequent_claims: alerts.filter(a => a.alertType === 'frequent_claims').length,
                    suspicious_pattern: alerts.filter(a => a.alertType === 'suspicious_pattern').length,
                    identity_mismatch: alerts.filter(a => a.alertType === 'identity_mismatch').length,
                    timing_anomaly: alerts.filter(a => a.alertType === 'timing_anomaly').length
                },
                preventedAmount: 0 // Would calculate from confirmed fraud claims
            };

            return stats;
        } catch (error) {
            console.error('Failed to get fraud stats:', error);
            return {
                totalAlerts: 0,
                openAlerts: 0,
                confirmedFraud: 0,
                falsePositives: 0,
                averageRiskScore: 0,
                alertsBySeverity: { low: 0, medium: 0, high: 0, critical: 0 },
                alertsByType: {
                    duplicate_claim: 0,
                    unusual_amount: 0,
                    frequent_claims: 0,
                    suspicious_pattern: 0,
                    identity_mismatch: 0,
                    timing_anomaly: 0
                },
                preventedAmount: 0
            };
        }
    },

    /**
     * Subscribe to fraud alerts
     */
    subscribeToAlerts: (callback: (alerts: FraudAlert[]) => void): Unsubscribe => {
        const q = query(collection(db, 'fraudAlerts'), orderBy('detectedAt', 'desc'));

        return onSnapshot(q, (snapshot) => {
            const alerts: FraudAlert[] = [];
            snapshot.forEach((doc) => {
                alerts.push({ id: doc.id, ...doc.data() } as FraudAlert);
            });
            callback(alerts);
        });
    }
};
