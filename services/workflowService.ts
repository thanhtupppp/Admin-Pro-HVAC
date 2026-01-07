import { db } from './firebaseConfig';
import {
    collection,
    doc,
    getDocs,
    getDoc,
    addDoc,
    updateDoc,
    deleteDoc,
    query,
    where,
    Unsubscribe,
    onSnapshot
} from 'firebase/firestore';
import {
    Workflow,
    WorkflowStep,
    ApprovalChain,
    ApprovalStep,
    Approval,
    ApprovalDecision,
    Claim
} from '../types/claim';

/**
 * Workflow Service
 * Handles workflow management and execution
 */
export const workflowService = {
    /**
     * Get all workflows
     */
    getWorkflows: async (): Promise<Workflow[]> => {
        try {
            const snapshot = await getDocs(collection(db, 'workflows'));
            const workflows: Workflow[] = [];

            snapshot.forEach((doc) => {
                workflows.push({ id: doc.id, ...doc.data() } as Workflow);
            });

            return workflows;
        } catch (error) {
            console.error('Failed to get workflows:', error);
            return [];
        }
    },

    /**
     * Get single workflow
     */
    getWorkflow: async (id: string): Promise<Workflow | null> => {
        try {
            const docRef = doc(db, 'workflows', id);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                return { id: docSnap.id, ...docSnap.data() } as Workflow;
            }
            return null;
        } catch (error) {
            console.error('Failed to get workflow:', error);
            return null;
        }
    },

    /**
     * Create workflow
     */
    createWorkflow: async (data: Omit<Workflow, 'id' | 'createdAt' | 'updatedAt'>): Promise<Workflow> => {
        const now = new Date().toISOString();
        const newWorkflow = {
            ...data,
            createdAt: now,
            updatedAt: now
        };

        const docRef = await addDoc(collection(db, 'workflows'), newWorkflow);
        return { id: docRef.id, ...newWorkflow } as Workflow;
    },

    /**
     * Update workflow
     */
    updateWorkflow: async (id: string, updates: Partial<Workflow>): Promise<void> => {
        const docRef = doc(db, 'workflows', id);
        await updateDoc(docRef, {
            ...updates,
            updatedAt: new Date().toISOString()
        });
    },

    /**
     * Delete workflow
     */
    deleteWorkflow: async (id: string): Promise<void> => {
        const docRef = doc(db, 'workflows', id);
        await deleteDoc(docRef);
    },

    /**
     * Start workflow for a claim
     */
    startWorkflow: async (claimId: string, workflowId: string): Promise<ApprovalChain> => {
        const workflow = await workflowService.getWorkflow(workflowId);

        if (!workflow) {
            throw new Error('Workflow not found');
        }

        // Create approval chain
        const approvalSteps: ApprovalStep[] = workflow.steps
            .filter(step => step.type === 'approval')
            .map((step, index) => ({
                stepNumber: index + 1,
                stepId: step.id,
                stepName: step.name,
                approverIds: step.config.approvers || [],
                approvalType: step.config.approvalType || 'any',
                approvals: [],
                status: index === 0 ? 'in_progress' : 'pending',
                dueDate: step.config.timeoutHours
                    ? new Date(Date.now() + step.config.timeoutHours * 60 * 60 * 1000).toISOString()
                    : undefined
            }));

        const chain: Omit<ApprovalChain, 'id'> = {
            claimId,
            workflowId,
            currentStep: 0,
            steps: approvalSteps,
            status: 'pending',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        const docRef = await addDoc(collection(db, 'approvalChains'), chain);
        return { id: docRef.id, ...chain } as ApprovalChain;
    },

    /**
     * Submit approval decision
     */
    submitApproval: async (
        chainId: string,
        approverId: string,
        approverName: string,
        decision: ApprovalDecision,
        comment?: string
    ): Promise<void> => {
        const chainRef = doc(db, 'approvalChains', chainId);
        const chainSnap = await getDoc(chainRef);

        if (!chainSnap.exists()) {
            throw new Error('Approval chain not found');
        }

        const chain = { id: chainSnap.id, ...chainSnap.data() } as ApprovalChain;
        const currentStep = chain.steps[chain.currentStep];

        // Add approval
        const approval: Approval = {
            id: `appr_${Date.now()}`,
            approverId,
            approverName,
            decision,
            comment,
            timestamp: new Date().toISOString()
        };

        currentStep.approvals.push(approval);

        // Check if step is complete
        const stepComplete = workflowService.isStepComplete(currentStep);

        if (stepComplete) {
            currentStep.status = decision === 'approve' ? 'approved' : 'rejected';
            currentStep.completedAt = new Date().toISOString();

            // Move to next step or complete chain
            if (decision === 'approve' && chain.currentStep < chain.steps.length - 1) {
                chain.currentStep++;
                chain.steps[chain.currentStep].status = 'in_progress';
            } else {
                chain.status = decision === 'approve' ? 'approved' : 'rejected';
            }
        }

        await updateDoc(chainRef, {
            steps: chain.steps,
            currentStep: chain.currentStep,
            status: chain.status,
            updatedAt: new Date().toISOString()
        });
    },

    /**
     * Check if approval step is complete
     */
    isStepComplete: (step: ApprovalStep): boolean => {
        const approvals = step.approvals.filter(a =>
            a.decision === 'approve' || a.decision === 'reject'
        );

        if (approvals.length === 0) return false;

        switch (step.approvalType) {
            case 'any':
                return approvals.length > 0;

            case 'all':
                return approvals.length === step.approverIds.length;

            case 'majority':
                const required = Math.ceil(step.approverIds.length / 2);
                return approvals.length >= required;

            default:
                return false;
        }
    },

    /**
     * Get approval chain for claim
     */
    getApprovalChain: async (claimId: string): Promise<ApprovalChain | null> => {
        try {
            const q = query(
                collection(db, 'approvalChains'),
                where('claimId', '==', claimId)
            );

            const snapshot = await getDocs(q);

            if (!snapshot.empty) {
                const doc = snapshot.docs[0];
                return { id: doc.id, ...doc.data() } as ApprovalChain;
            }

            return null;
        } catch (error) {
            console.error('Failed to get approval chain:', error);
            return null;
        }
    },

    /**
     * Subscribe to approval chain changes
     */
    subscribeToApprovalChain: (
        claimId: string,
        callback: (chain: ApprovalChain | null) => void
    ): Unsubscribe => {
        const q = query(
            collection(db, 'approvalChains'),
            where('claimId', '==', claimId)
        );

        return onSnapshot(q, (snapshot) => {
            if (!snapshot.empty) {
                const doc = snapshot.docs[0];
                callback({ id: doc.id, ...doc.data() } as ApprovalChain);
            } else {
                callback(null);
            }
        });
    }
};
