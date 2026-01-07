import { db } from './firebaseConfig';
import {
    collection,
    doc,
    getDocs,
    addDoc,
    updateDoc,
    deleteDoc,
    query,
    where,
    increment
} from 'firebase/firestore';
import { DiscountCode, DiscountValidation } from '../types/discount';

/**
 * Discount Code Service
 */
export const discountService = {
    /**
     * Get all discount codes
     */
    getAllCodes: async (): Promise<DiscountCode[]> => {
        try {
            const snapshot = await getDocs(collection(db, 'discountCodes'));
            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as DiscountCode));
        } catch (error) {
            console.error('Failed to get discount codes:', error);
            return [];
        }
    },

    /**
     * Create discount code
     */
    createCode: async (data: Omit<DiscountCode, 'id' | 'usedCount' | 'usedBy' | 'createdAt' | 'updatedAt'>): Promise<DiscountCode> => {
        const now = new Date().toISOString();
        const newCode = {
            ...data,
            code: data.code.toUpperCase(),
            usedCount: 0,
            usedBy: [],
            createdAt: now,
            updatedAt: now
        };

        const docRef = await addDoc(collection(db, 'discountCodes'), newCode);
        return { id: docRef.id, ...newCode } as DiscountCode;
    },

    /**
     * Update discount code
     */
    updateCode: async (id: string, updates: Partial<DiscountCode>): Promise<void> => {
        const docRef = doc(db, 'discountCodes', id);
        await updateDoc(docRef, {
            ...updates,
            updatedAt: new Date().toISOString()
        });
    },

    /**
     * Delete discount code
     */
    deleteCode: async (id: string): Promise<void> => {
        await deleteDoc(doc(db, 'discountCodes', id));
    },

    /**
     * Validate discount code
     */
    validateCode: async (
        code: string,
        amount: number,
        userId: string,
        planId?: string
    ): Promise<DiscountValidation> => {
        try {
            // Find active code
            const q = query(
                collection(db, 'discountCodes'),
                where('code', '==', code.toUpperCase()),
                where('status', '==', 'active')
            );

            const snapshot = await getDocs(q);

            if (snapshot.empty) {
                return {
                    valid: false,
                    discount: 0,
                    message: 'Mã giảm giá không tồn tại hoặc đã hết hạn'
                };
            }

            const discountDoc = snapshot.docs[0];
            const discount = { id: discountDoc.id, ...discountDoc.data() } as DiscountCode;

            // Check expiry
            const now = new Date();
            if (now < new Date(discount.validFrom)) {
                return {
                    valid: false,
                    discount: 0,
                    message: 'Mã giảm giá chưa có hiệu lực'
                };
            }

            if (now > new Date(discount.validTo)) {
                // Auto-update status to expired
                await discountService.updateCode(discount.id, { status: 'expired' });
                return {
                    valid: false,
                    discount: 0,
                    message: 'Mã giảm giá đã hết hạn'
                };
            }

            // Check usage limit
            if (discount.usageLimit && discount.usedCount >= discount.usageLimit) {
                return {
                    valid: false,
                    discount: 0,
                    message: 'Mã giảm giá đã hết lượt sử dụng'
                };
            }

            // Check if user already used
            if (discount.usedBy.includes(userId)) {
                return {
                    valid: false,
                    discount: 0,
                    message: 'Bạn đã sử dụng mã giảm giá này rồi'
                };
            }

            // Check minimum purchase
            if (discount.minPurchase && amount < discount.minPurchase) {
                return {
                    valid: false,
                    discount: 0,
                    message: `Đơn hàng tối thiểu ${discount.minPurchase.toLocaleString('vi-VN')}đ`
                };
            }

            // Check applicable plans
            if (planId && discount.applicablePlans && discount.applicablePlans.length > 0) {
                if (!discount.applicablePlans.includes(planId)) {
                    return {
                        valid: false,
                        discount: 0,
                        message: 'Mã giảm giá không áp dụng cho gói dịch vụ này'
                    };
                }
            }

            // Calculate discount
            let discountAmount = discount.type === 'percentage'
                ? (amount * discount.value / 100)
                : discount.value;

            // Apply max discount
            if (discount.maxDiscount) {
                discountAmount = Math.min(discountAmount, discount.maxDiscount);
            }

            const finalAmount = Math.max(0, amount - discountAmount);

            return {
                valid: true,
                discount: discountAmount,
                finalAmount,
                message: `Giảm ${discountAmount.toLocaleString('vi-VN')}đ`,
                code: discount
            };
        } catch (error) {
            console.error('Discount validation failed:', error);
            return {
                valid: false,
                discount: 0,
                message: 'Có lỗi khi kiểm tra mã giảm giá'
            };
        }
    },

    /**
     * Apply discount (mark as used)
     */
    applyCode: async (codeId: string, userId: string): Promise<void> => {
        const docRef = doc(db, 'discountCodes', codeId);
        await updateDoc(docRef, {
            usedCount: increment(1),
            usedBy: [...(await discountService.getCode(codeId))?.usedBy || [], userId],
            updatedAt: new Date().toISOString()
        });
    },

    /**
     * Get single code
     */
    getCode: async (id: string): Promise<DiscountCode | null> => {
        try {
            const docRef = doc(db, 'discountCodes', id);
            const docSnap = await (await import('firebase/firestore')).getDoc(docRef);

            if (docSnap.exists()) {
                return { id: docSnap.id, ...docSnap.data() } as DiscountCode;
            }
            return null;
        } catch (error) {
            console.error('Failed to get discount code:', error);
            return null;
        }
    },

    /**
     * Get active codes for display
     */
    getActiveCodes: async (): Promise<DiscountCode[]> => {
        try {
            const q = query(
                collection(db, 'discountCodes'),
                where('status', '==', 'active')
            );
            const snapshot = await getDocs(q);

            return snapshot.docs
                .map(doc => ({ id: doc.id, ...doc.data() } as DiscountCode))
                .filter(code => new Date() <= new Date(code.validTo));
        } catch (error) {
            console.error('Failed to get active codes:', error);
            return [];
        }
    }
};
