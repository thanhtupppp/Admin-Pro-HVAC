import { db } from './firebaseConfig';
import {
    collection,
    doc,
    getDocs,
    addDoc,
    updateDoc,
    deleteDoc,
    query,
    orderBy,
    Unsubscribe,
    onSnapshot
} from 'firebase/firestore';
import {
    ClaimRule,
    RuleEvaluationResult,
    Claim,
    RuleCondition,
    RuleAction
} from '../types/claim';

/**
 * Rules Service
 * Handles rules management and evaluation
 */
export const rulesService = {
    /**
     * Get all rules
     */
    getRules: async (): Promise<ClaimRule[]> => {
        try {
            const q = query(collection(db, 'claimRules'), orderBy('priority', 'asc'));
            const snapshot = await getDocs(q);
            const rules: ClaimRule[] = [];

            snapshot.forEach((doc) => {
                rules.push({ id: doc.id, ...doc.data() } as ClaimRule);
            });

            return rules;
        } catch (error) {
            console.error('Failed to get rules:', error);
            return [];
        }
    },

    /**
     * Create new rule
     */
    createRule: async (data: Omit<ClaimRule, 'id' | 'createdAt' | 'updatedAt'>): Promise<ClaimRule> => {
        const now = new Date().toISOString();
        const newRule = {
            ...data,
            createdAt: now,
            updatedAt: now
        };

        const docRef = await addDoc(collection(db, 'claimRules'), newRule);
        return { id: docRef.id, ...newRule } as ClaimRule;
    },

    /**
     * Update rule
     */
    updateRule: async (id: string, updates: Partial<ClaimRule>): Promise<void> => {
        const docRef = doc(db, 'claimRules', id);
        await updateDoc(docRef, {
            ...updates,
            updatedAt: new Date().toISOString()
        });
    },

    /**
     * Delete rule
     */
    deleteRule: async (id: string): Promise<void> => {
        const docRef = doc(db, 'claimRules', id);
        await deleteDoc(docRef);
    },

    /**
     * Evaluate claim against all active rules
     * Returns first matching rule
     */
    evaluateClaim: async (claim: Claim): Promise<RuleEvaluationResult> => {
        try {
            const rules = await rulesService.getRules();
            const activeRules = rules
                .filter(r => r.status === 'active')
                .sort((a, b) => a.priority - b.priority);

            for (const rule of activeRules) {
                const matched = rulesService.evaluateConditions(claim, rule.conditions);

                if (matched) {
                    return {
                        matched: true,
                        rule,
                        action: rule.actions[0], // Execute first action
                        explanation: `Matched rule: ${rule.name}`
                    };
                }
            }

            return {
                matched: false,
                explanation: 'No matching rules found'
            };
        } catch (error) {
            console.error('Rule evaluation failed:', error);
            return {
                matched: false,
                explanation: 'Evaluation error'
            };
        }
    },

    /**
     * Evaluate conditions with AND/OR logic
     */
    evaluateConditions: (claim: Claim, conditions: RuleCondition[]): boolean => {
        if (conditions.length === 0) return true;

        let result = true;
        let currentLogic: 'AND' | 'OR' = 'AND';

        for (const condition of conditions) {
            const conditionResult = rulesService.evaluateCondition(claim, condition);

            if (currentLogic === 'AND') {
                result = result && conditionResult;
            } else {
                result = result || conditionResult;
            }

            currentLogic = condition.logicOperator || 'AND';
        }

        return result;
    },

    /**
     * Evaluate single condition
     */
    evaluateCondition: (claim: Claim, condition: RuleCondition): boolean => {
        const fieldValue = rulesService.getFieldValue(claim, condition.field);
        const targetValue = condition.value;

        switch (condition.operator) {
            case 'equals':
                return fieldValue === targetValue;

            case 'not_equals':
                return fieldValue !== targetValue;

            case 'greater_than':
                return Number(fieldValue) > Number(targetValue);

            case 'less_than':
                return Number(fieldValue) < Number(targetValue);

            case 'greater_or_equal':
                return Number(fieldValue) >= Number(targetValue);

            case 'less_or_equal':
                return Number(fieldValue) <= Number(targetValue);

            case 'contains':
                return String(fieldValue).toLowerCase().includes(String(targetValue).toLowerCase());

            case 'in_range':
                const [min, max] = targetValue as [number, number];
                return Number(fieldValue) >= min && Number(fieldValue) <= max;

            default:
                return false;
        }
    },

    /**
     * Get field value from claim
     */
    getFieldValue: (claim: Claim, field: string): any => {
        switch (field) {
            case 'amount':
                return claim.amount;
            case 'type':
                return claim.type;
            case 'category':
                return claim.category;
            case 'customerTier':
                // This would come from customer data
                return 'standard'; // Mock
            case 'claimCount':
                // This would need to query previous claims
                return 0; // Mock
            case 'submissionTime':
                // Check if submitted during business hours (9-17)
                if (claim.submittedAt) {
                    const hour = new Date(claim.submittedAt).getHours();
                    return hour >= 9 && hour <= 17;
                }
                return false;
            default:
                return null;
        }
    },

    /**
     * Test rule with sample claim
     */
    testRule: (rule: ClaimRule, testClaim: Claim): RuleEvaluationResult => {
        const matched = rulesService.evaluateConditions(testClaim, rule.conditions);

        return {
            matched,
            rule: matched ? rule : undefined,
            action: matched ? rule.actions[0] : undefined,
            explanation: matched
                ? `Rule "${rule.name}" would match this claim`
                : `Rule "${rule.name}" does not match`
        };
    },

    /**
     * Subscribe to rules changes
     */
    subscribeToRules: (callback: (rules: ClaimRule[]) => void): Unsubscribe => {
        const q = query(collection(db, 'claimRules'), orderBy('priority', 'asc'));

        return onSnapshot(q, (snapshot) => {
            const rules: ClaimRule[] = [];
            snapshot.forEach((doc) => {
                rules.push({ id: doc.id, ...doc.data() } as ClaimRule);
            });
            callback(rules);
        });
    }
};
