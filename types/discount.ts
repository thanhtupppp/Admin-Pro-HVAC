/**
 * Discount Code Types
 */

export interface DiscountCode {
    id: string;
    code: string;
    name: string;
    description: string;
    type: 'percentage' | 'fixed';
    value: number; // Percentage (0-100) or fixed amount

    // Constraints
    minPurchase?: number;
    maxDiscount?: number;
    applicablePlans?: string[]; // Empty = all plans

    // Validity
    validFrom: string;
    validTo: string;

    // Usage
    usageLimit?: number; // null = unlimited
    usedCount: number;
    usedBy: string[]; // User IDs

    // Status
    status: 'active' | 'inactive' | 'expired';

    // Metadata
    createdBy: string;
    createdAt: string;
    updatedAt: string;
}

export interface DiscountValidation {
    valid: boolean;
    discount: number;
    message: string;
    finalAmount?: number;
    code?: DiscountCode;
}
