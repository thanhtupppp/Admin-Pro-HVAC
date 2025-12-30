import { db } from './firebaseConfig';
import {
    collection,
    getDocs,
    doc,
    getDoc,
    setDoc,
    updateDoc,
    query,
    orderBy,
    where
} from 'firebase/firestore';
import { Coupon } from '../types';

export const couponService = {
    /**
     * Lấy tất cả coupons
     */
    getCoupons: async (): Promise<Coupon[]> => {
        try {
            const q = query(collection(db, 'coupons'), orderBy('createdAt', 'desc'));
            const querySnapshot = await getDocs(q);
            const coupons: Coupon[] = [];

            querySnapshot.forEach((doc) => {
                coupons.push({ id: doc.id, ...doc.data() } as Coupon);
            });

            return coupons;
        } catch (e) {
            console.error('Failed to get coupons', e);
            return [];
        }
    },

    /**
     * Lấy 1 coupon theo code
     */
    getCouponByCode: async (code: string): Promise<Coupon | null> => {
        try {
            const q = query(collection(db, 'coupons'), where('code', '==', code.toUpperCase()));
            const querySnapshot = await getDocs(q);

            if (!querySnapshot.empty) {
                const doc = querySnapshot.docs[0];
                return { id: doc.id, ...doc.data() } as Coupon;
            }
            return null;
        } catch (e) {
            console.error('Failed to get coupon by code', e);
            return null;
        }
    },

    /**
     * Tạo coupon mới
     */
    createCoupon: async (coupon: Omit<Coupon, 'id' | 'createdAt' | 'updatedAt'>): Promise<Coupon> => {
        const now = new Date().toISOString();
        const newCoupon: Omit<Coupon, 'id'> = {
            ...coupon,
            code: coupon.code.toUpperCase(), // Always uppercase
            createdAt: now,
            updatedAt: now
        };

        const docRef = doc(collection(db, 'coupons'));
        await setDoc(docRef, newCoupon);

        return { id: docRef.id, ...newCoupon };
    },

    /**
     * Cập nhật coupon
     */
    updateCoupon: async (id: string, updates: Partial<Coupon>): Promise<Coupon> => {
        const docRef = doc(db, 'coupons', id);
        const now = new Date().toISOString();

        await updateDoc(docRef, {
            ...updates,
            updatedAt: now
        });

        const updatedDoc = await getDoc(docRef);
        return { id: updatedDoc.id, ...updatedDoc.data() } as Coupon;
    },

    /**
     * Xóa coupon (set status = 'disabled')
     */
    deleteCoupon: async (id: string): Promise<void> => {
        const docRef = doc(db, 'coupons', id);
        await updateDoc(docRef, {
            status: 'disabled',
            updatedAt: new Date().toISOString()
        });
    },

    /**
     * Validate coupon khi apply
     */
    validateCoupon: async (code: string, planId?: string): Promise<{ valid: boolean; message: string; coupon?: Coupon }> => {
        const coupon = await couponService.getCouponByCode(code);

        if (!coupon) {
            return { valid: false, message: 'Mã giảm giá không tồn tại.' };
        }

        if (coupon.status === 'disabled') {
            return { valid: false, message: 'Mã giảm giá đã bị vô hiệu hóa.' };
        }

        if (coupon.status === 'expired') {
            return { valid: false, message: 'Mã giảm giá đã hết hạn.' };
        }

        // Check dates
        const now = new Date();
        const validFrom = new Date(coupon.validFrom);
        const validTo = new Date(coupon.validTo);

        if (now < validFrom) {
            return { valid: false, message: 'Mã giảm giá chưa có hiệu lực.' };
        }

        if (now > validTo) {
            // Auto-expire
            await couponService.updateCoupon(coupon.id, { status: 'expired' });
            return { valid: false, message: 'Mã giảm giá đã hết hạn.' };
        }

        // Check usage limit
        if (coupon.usedCount >= coupon.usageLimit) {
            return { valid: false, message: 'Mã giảm giá đã hết lượt sử dụng.' };
        }

        // Check applicable plans
        if (planId && coupon.applicablePlans && coupon.applicablePlans.length > 0) {
            if (!coupon.applicablePlans.includes(planId)) {
                return { valid: false, message: 'Mã giảm giá không áp dụng cho gói này.' };
            }
        }

        return { valid: true, message: 'Mã giảm giá hợp lệ!', coupon };
    },

    /**
     * Apply coupon (tăng usedCount)
     */
    applyCoupon: async (id: string): Promise<void> => {
        const coupon = await getDoc(doc(db, 'coupons', id));
        if (coupon.exists()) {
            const data = coupon.data() as Coupon;
            await updateDoc(doc(db, 'coupons', id), {
                usedCount: data.usedCount + 1
            });
        }
    },

    /**
     * Calculate discounted price
     */
    calculateDiscount: (originalPrice: number, coupon: Coupon): number => {
        if (coupon.discountType === 'percent') {
            return originalPrice * (1 - coupon.discountValue / 100);
        } else {
            return Math.max(0, originalPrice - coupon.discountValue);
        }
    }
};
