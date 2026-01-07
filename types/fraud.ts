/**
 * Fraud Detection Types
 */

export interface FraudAlert {
    id: string;
    claimId: string;
    claimNumber: string;
    alertType: FraudAlertType;
    riskScore: number; // 0-100
    severity: 'low' | 'medium' | 'high' | 'critical';
    reasons: FraudReason[];
    status: 'open' | 'investigating' | 'confirmed' | 'false_positive' | 'resolved';
    detectedAt: string;
    investigatedBy?: string;
    resolvedAt?: string;
    notes?: string;
    createdAt: string;
    updatedAt: string;
}

export type FraudAlertType =
    | 'duplicate_claim'
    | 'unusual_amount'
    | 'frequent_claims'
    | 'suspicious_pattern'
    | 'identity_mismatch'
    | 'timing_anomaly';

export interface FraudReason {
    code: string;
    description: string;
    weight: number; // Contribution to risk score
}

export interface FraudPattern {
    id: string;
    name: string;
    description: string;
    type: FraudAlertType;
    conditions: PatternCondition[];
    riskWeight: number;
    isActive: boolean;
    detectionCount: number;
    createdAt: string;
    updatedAt: string;
}

export interface PatternCondition {
    field: string;
    operator: 'equals' | 'greater_than' | 'less_than' | 'contains' | 'matches_pattern';
    value: any;
    lookbackDays?: number;
}

export interface FraudStats {
    totalAlerts: number;
    openAlerts: number;
    confirmedFraud: number;
    falsePositives: number;
    averageRiskScore: number;
    alertsBySeverity: Record<'low' | 'medium' | 'high' | 'critical', number>;
    alertsByType: Record<FraudAlertType, number>;
    preventedAmount: number; // Amount saved by detecting fraud
}

export interface DuplicateClaim {
    claimId1: string;
    claimId2: string;
    similarity: number; // 0-100%
    matchingFields: string[];
    timeDifference: number; // hours
}

// AI Anomaly Detection
export interface AnomalyScore {
    claimId: string;
    overallScore: number; // 0-100, higher = more anomalous
    factors: AnomalyFactor[];
    recommendation: 'approve' | 'review' | 'reject';
}

export interface AnomalyFactor {
    name: string;
    score: number;
    description: string;
    evidence: string[];
}
