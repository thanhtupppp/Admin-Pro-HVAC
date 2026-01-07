import { db } from './firebaseConfig';
import {
    collection,
    doc,
    getDoc,
    getDocs,
    addDoc,
    updateDoc,
    deleteDoc,
    query,
    where,
    orderBy,
    onSnapshot,
    Timestamp,
    Unsubscribe,
    limit
} from 'firebase/firestore';
import { Claim, ClaimStatus, ClaimsStats, ClaimTimeline } from '../types/claim';

/**
 * Claims Service
 * Handles CRUD operations and real-time subscriptions for claims
 */
export const claimService = {
    /**
     * Get all claims with optional filtering
     */
    getClaims: async (filters?: {
        status?: ClaimStatus;
        customerId?: string;
        dateFrom?: string;
        dateTo?: string;
    }): Promise<Claim[]> => {
        try {
            let q = query(collection(db, 'claims'), orderBy('createdAt', 'desc'));

            if (filters?.status) {
                q = query(q, where('status', '==', filters.status));
            }
            if (filters?.customerId) {
                q = query(q, where('customerId', '==', filters.customerId));
            }

            const snapshot = await getDocs(q);
            const claims: Claim[] = [];

            snapshot.forEach((doc) => {
                const data = doc.data();
                claims.push({
                    id: doc.id,
                    ...data,
                    createdAt: data.createdAt || new Date().toISOString(),
                    updatedAt: data.updatedAt || new Date().toISOString()
                } as Claim);
            });

            return claims;
        } catch (error) {
            console.error('Failed to get claims:', error);
            return [];
        }
    },

    /**
     * Get single claim by ID
     */
    getClaim: async (id: string): Promise<Claim | null> => {
        try {
            const docRef = doc(db, 'claims', id);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                return { id: docSnap.id, ...docSnap.data() } as Claim;
            }
            return null;
        } catch (error) {
            console.error('Failed to get claim:', error);
            return null;
        }
    },

    /**
     * Create new claim
     */
    createClaim: async (data: Omit<Claim, 'id' | 'createdAt' | 'updatedAt'>): Promise<Claim> => {
        const now = new Date().toISOString();
        const newClaim = {
            ...data,
            claimNumber: `CLM-${Date.now()}`,
            createdAt: now,
            updatedAt: now
        };

        const docRef = await addDoc(collection(db, 'claims'), newClaim);
        return { id: docRef.id, ...newClaim } as Claim;
    },

    /**
     * Update claim
     */
    updateClaim: async (id: string, updates: Partial<Claim>): Promise<void> => {
        const docRef = doc(db, 'claims', id);
        await updateDoc(docRef, {
            ...updates,
            updatedAt: new Date().toISOString()
        });
    },

    /**
     * Update claim status with timestamp
     */
    updateClaimStatus: async (id: string, status: ClaimStatus, reason?: string): Promise<void> => {
        const updates: Partial<Claim> = {
            status,
            updatedAt: new Date().toISOString()
        };

        const now = new Date().toISOString();

        if (status === 'in_review') {
            updates.reviewedAt = now;
        } else if (status === 'approved') {
            updates.approvedAt = now;
        } else if (status === 'rejected') {
            updates.rejectedAt = now;
            if (reason) updates.rejectionReason = reason;
        }

        const docRef = doc(db, 'claims', id);
        await updateDoc(docRef, updates);
    },

    /**
     * Delete claim (soft delete by setting status to cancelled)
     */
    deleteClaim: async (id: string): Promise<void> => {
        await claimService.updateClaimStatus(id, 'cancelled');
    },

    /**
     * Real-time subscription to claims
     */
    subscribeToClaims: (
        callback: (claims: Claim[]) => void,
        filters?: { status?: ClaimStatus }
    ): Unsubscribe => {
        let q = query(collection(db, 'claims'), orderBy('createdAt', 'desc'));

        if (filters?.status) {
            q = query(q, where('status', '==', filters.status));
        }

        return onSnapshot(q, (snapshot) => {
            const claims: Claim[] = [];
            snapshot.forEach((doc) => {
                claims.push({ id: doc.id, ...doc.data() } as Claim);
            });
            callback(claims);
        });
    },

    /**
     * Get claims statistics
     */
    getClaimsStats: async (dateFrom?: string, dateTo?: string): Promise<ClaimsStats> => {
        try {
            const claims = await claimService.getClaims();

            const stats: ClaimsStats = {
                total: claims.length,
                byStatus: {
                    draft: 0,
                    submitted: 0,
                    in_review: 0,
                    pending_approval: 0,
                    approved: 0,
                    rejected: 0,
                    cancelled: 0
                },
                byType: {},
                totalAmount: 0,
                averageAmount: 0,
                averageProcessingTime: 0,
                approvalRate: 0,
                autoApprovalRate: 0
            };

            let processingTimes: number[] = [];
            let approvedCount = 0;
            let autoApprovedCount = 0;

            claims.forEach((claim) => {
                // Count by status
                stats.byStatus[claim.status]++;

                // Count by type
                stats.byType[claim.type] = (stats.byType[claim.type] || 0) + 1;

                // Sum amounts
                stats.totalAmount += claim.amount;

                // Calculate processing time
                if (claim.approvedAt && claim.submittedAt) {
                    const submitted = new Date(claim.submittedAt).getTime();
                    const approved = new Date(claim.approvedAt).getTime();
                    const hours = (approved - submitted) / (1000 * 60 * 60);
                    processingTimes.push(hours);
                    approvedCount++;

                    // Check if auto-approved (processed very quickly, e.g., < 1 minute)
                    if (hours < 0.017) { // < 1 minute
                        autoApprovedCount++;
                    }
                }
            });

            stats.averageAmount = claims.length > 0 ? stats.totalAmount / claims.length : 0;
            stats.averageProcessingTime = processingTimes.length > 0
                ? processingTimes.reduce((a, b) => a + b, 0) / processingTimes.length
                : 0;
            stats.approvalRate = claims.length > 0 ? (stats.byStatus.approved / claims.length) * 100 : 0;
            stats.autoApprovalRate = approvedCount > 0 ? (autoApprovedCount / approvedCount) * 100 : 0;

            return stats;
        } catch (error) {
            console.error('Failed to calculate stats:', error);
            return {
                total: 0,
                byStatus: {
                    draft: 0,
                    submitted: 0,
                    in_review: 0,
                    pending_approval: 0,
                    approved: 0,
                    rejected: 0,
                    cancelled: 0
                },
                byType: {},
                totalAmount: 0,
                averageAmount: 0,
                averageProcessingTime: 0,
                approvalRate: 0,
                autoApprovalRate: 0
            };
        }
    },

    /**
     * Get claims timeline (volume over time)
     */
    getClaimsTimeline: async (days: number = 30): Promise<ClaimTimeline[]> => {
        try {
            const claims = await claimService.getClaims();
            const timeline: Map<string, ClaimTimeline> = new Map();

            claims.forEach((claim) => {
                const date = claim.createdAt.split('T')[0]; // Get YYYY-MM-DD

                if (!timeline.has(date)) {
                    timeline.set(date, { date, count: 0, amount: 0 });
                }

                const entry = timeline.get(date)!;
                entry.count++;
                entry.amount += claim.amount;
            });

            return Array.from(timeline.values());
        } catch (error) {
            console.error('Failed to get timeline:', error);
            return [];
        }
    },

    /**
     * Get pending approvals for a user
     */
    getPendingApprovals: async (userId: string): Promise<Claim[]> => {
        try {
            // This would need to join with approval chains
            // For now, return claims in pending_approval status
            const q = query(
                collection(db, 'claims'),
                where('status', '==', 'pending_approval'),
                where('assignedTo', '==', userId)
            );

            const snapshot = await getDocs(q);
            const claims: Claim[] = [];

            snapshot.forEach((doc) => {
                claims.push({ id: doc.id, ...doc.data() } as Claim);
            });

            return claims;
        } catch (error) {
            console.error('Failed to get pending approvals:', error);
            return [];
        }
    }
};
