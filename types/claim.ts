/**
 * Claims Engine Type Definitions
 */

// ==================== CLAIM ====================

export interface Claim {
    id: string;
    claimNumber: string;
    customerId: string;
    customerName: string;
    customerEmail: string;
    type: 'warranty' | 'repair' | 'replacement' | 'refund';
    category: 'parts' | 'labor' | 'shipping' | 'other';
    amount: number;
    description: string;
    attachments: ClaimAttachment[];
    status: ClaimStatus;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    workflowId?: string;
    currentStep?: number;
    assignedTo?: string;
    submittedAt?: string;
    reviewedAt?: string;
    approvedAt?: string;
    rejectedAt?: string;
    rejectionReason?: string;
    createdAt: string;
    updatedAt: string;
}

export type ClaimStatus =
    | 'draft'
    | 'submitted'
    | 'in_review'
    | 'pending_approval'
    | 'approved'
    | 'rejected'
    | 'cancelled';

export interface ClaimAttachment {
    id: string;
    name: string;
    url: string;
    type: string;
    size: number;
    uploadedAt: string;
}

// ==================== RULES ====================

export interface ClaimRule {
    id: string;
    name: string;
    description: string;
    conditions: RuleCondition[];
    actions: RuleAction[];
    priority: number;
    status: 'active' | 'inactive';
    createdBy: string;
    createdAt: string;
    updatedAt: string;
}

export interface RuleCondition {
    field: ConditionField;
    operator: ConditionOperator;
    value: any;
    logicOperator?: 'AND' | 'OR';
}

export type ConditionField =
    | 'amount'
    | 'type'
    | 'category'
    | 'customerTier'
    | 'claimCount' // number of previous claims
    | 'submissionTime'; // submitted within business hours

export type ConditionOperator =
    | 'equals'
    | 'not_equals'
    | 'greater_than'
    | 'less_than'
    | 'greater_or_equal'
    | 'less_or_equal'
    | 'contains'
    | 'in_range';

export interface RuleAction {
    type: RuleActionType;
    parameters: Record<string, any>;
}

export type RuleActionType =
    | 'auto_approve'
    | 'auto_reject'
    | 'require_approval'
    | 'assign_to'
    | 'set_priority'
    | 'send_notification';

export interface RuleEvaluationResult {
    matched: boolean;
    rule?: ClaimRule;
    action?: RuleAction;
    explanation: string;
}

// ==================== WORKFLOW ====================

export interface Workflow {
    id: string;
    name: string;
    description: string;
    steps: WorkflowStep[];
    status: 'draft' | 'active' | 'archived';
    isDefault?: boolean;
    createdBy: string;
    createdAt: string;
    updatedAt: string;
}

export interface WorkflowStep {
    id: string;
    type: WorkflowStepType;
    name: string;
    position: { x: number; y: number };
    config: StepConfig;
    connections: string[]; // IDs of next steps
}

export type WorkflowStepType =
    | 'approval'
    | 'condition'
    | 'notification'
    | 'action';

export interface StepConfig {
    // For approval steps
    approvers?: string[]; // User IDs
    approvalType?: 'any' | 'all' | 'majority';
    timeoutHours?: number;
    escalationRules?: EscalationRule[];

    // For condition steps
    condition?: RuleCondition;
    trueNextStep?: string;
    falseNextStep?: string;

    // For notification steps
    recipients?: string[];
    template?: string;

    // For action steps
    action?: string;
    actionParams?: Record<string, any>;
}

export interface EscalationRule {
    afterHours: number;
    escalateTo: string[];
    notifyOriginal: boolean;
}

// ==================== APPROVAL ====================

export interface ApprovalChain {
    id: string;
    claimId: string;
    workflowId: string;
    currentStep: number;
    steps: ApprovalStep[];
    status: ApprovalChainStatus;
    createdAt: string;
    updatedAt: string;
}

export type ApprovalChainStatus =
    | 'pending'
    | 'approved'
    | 'rejected'
    | 'escalated'
    | 'cancelled';

export interface ApprovalStep {
    stepNumber: number;
    stepId: string;
    stepName: string;
    approverIds: string[];
    approvalType: 'any' | 'all' | 'majority';
    approvals: Approval[];
    status: ApprovalStepStatus;
    dueDate?: string;
    completedAt?: string;
}

export type ApprovalStepStatus =
    | 'pending'
    | 'in_progress'
    | 'approved'
    | 'rejected'
    | 'skipped';

export interface Approval {
    id: string;
    approverId: string;
    approverName: string;
    decision: ApprovalDecision;
    comment?: string;
    timestamp: string;
}

export type ApprovalDecision =
    | 'approve'
    | 'reject'
    | 'request_info'
    | 'delegate';

// ==================== ANALYTICS ====================

export interface ClaimsStats {
    total: number;
    byStatus: Record<ClaimStatus, number>;
    byType: Record<string, number>;
    totalAmount: number;
    averageAmount: number;
    averageProcessingTime: number; // hours
    approvalRate: number; // percentage
    autoApprovalRate: number; // percentage
}

export interface ClaimTimeline {
    date: string;
    count: number;
    amount: number;
}
