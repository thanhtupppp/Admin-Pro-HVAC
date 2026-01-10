import { db } from './firebaseConfig';
import {
    collection,
    getDocs,
    doc,
    getDoc,
    setDoc,
    updateDoc,
    deleteDoc,
    query,
    orderBy,
    Timestamp
} from 'firebase/firestore';

export interface Plan {
    id: string;
    name: string;
    displayName: string;
    price: number;
    billingCycle: 'monthly' | 'yearly';
    tier: 'Free' | 'Basic' | 'Premium' | 'Enterprise';
    description: string;
    features: string[]; // Normalized to string array for simplicity
    badge?: string;
    badgeColor?: string;
    isPopular?: boolean;
    status: 'active' | 'inactive';
    createdAt: string;
    updatedAt: string;
    limits?: {
        maxUsers: number;
        maxErrorCodes: number;
        aiQuota: number;
    };
    discount?: number;
}

export interface PlanFeature {
    label: string;
    enabled: boolean;
}

export type PricingPlan = Plan;

export const planService = {
    /**
     * Lấy tất cả plans
     */
    getPlans: async (): Promise<Plan[]> => {
        try {
            const q = query(collection(db, 'servicePlans'));
            const querySnapshot = await getDocs(q);
            const plans: Plan[] = [];

            querySnapshot.forEach((doc) => {
                plans.push({ id: doc.id, ...doc.data() } as Plan);
            });

            // Sort by price in memory to avoid index issues
            return plans.sort((a, b) => a.price - b.price);
        } catch (e) {
            console.error('Failed to get plans', e);
            return [];
        }
    },

    getPlan: async (id: string): Promise<Plan | null> => {
        try {
            const docRef = doc(db, 'servicePlans', id);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                return { id: docSnap.id, ...docSnap.data() } as Plan;
            }
            return null;
        } catch (e) {
            console.error('Failed to get plan', e);
            return null;
        }
    },

    createPlan: async (plan: Omit<Plan, 'id' | 'createdAt' | 'updatedAt'>): Promise<Plan> => {
        const now = new Date().toISOString();
        const newPlan = {
            ...plan,
            createdAt: now,
            updatedAt: now
        };

        const docRef = doc(collection(db, 'servicePlans'));
        await setDoc(docRef, newPlan);

        return { id: docRef.id, ...newPlan };
    },

    updatePlan: async (id: string, updates: Partial<Plan>): Promise<Plan> => {
        const docRef = doc(db, 'servicePlans', id);
        const now = new Date().toISOString();

        await updateDoc(docRef, {
            ...updates,
            updatedAt: now
        });

        const updatedDoc = await getDoc(docRef);
        return { id: updatedDoc.id, ...updatedDoc.data() } as Plan;
    },

    deletePlan: async (id: string): Promise<void> => {
        const docRef = doc(db, 'servicePlans', id);
        await deleteDoc(docRef);
    },

    /**
     * Khởi tạo default plans (chạy 1 lần)
     */
    initializeDefaultPlans: async (): Promise<void> => {
        const existingPlans = await planService.getPlans();
        if (existingPlans.length > 0) {
            console.log('Plans already initialized');
            return;
        }

        const defaultPlans: Omit<Plan, 'id' | 'createdAt' | 'updatedAt'>[] = [
            {
                name: 'Free',
                displayName: 'Gói Miễn phí',
                price: 0,
                billingCycle: 'monthly',
                tier: 'Free',
                description: 'Dành cho cá nhân trải nghiệm',
                badge: 'Cơ bản',
                badgeColor: 'gray',
                isPopular: false,
                status: 'active',
                features: [
                    'Tra cứu mã lỗi cơ bản',
                    'Giới hạn 50 mã lỗi',
                    'Quét OCR 5 lần/ngày',
                    'Không hỗ trợ AI Smart Import'
                ],
                limits: { maxUsers: 1, maxErrorCodes: 50, aiQuota: 5 }
            },
            {
                name: 'Basic',
                displayName: 'Gói Cơ bản',
                price: 199000,
                billingCycle: 'monthly',
                tier: 'Basic',
                description: 'Cho thợ sửa chữa độc lập',
                badge: '',
                badgeColor: '',
                isPopular: false,
                status: 'active',
                features: [
                    'Tra cứu không giới hạn',
                    'Lưu 200 mã lỗi riêng',
                    'Quét OCR 50 lần/ngày',
                    'AI Smart Import (Basic)',
                    'Không quảng cáo'
                ],
                limits: { maxUsers: 1, maxErrorCodes: 200, aiQuota: 50 }
            },
            {
                name: 'Pro', // UI logic calls it 'Pro' sometimes, let's match tier Premium
                displayName: 'Gói Chuyên nghiệp',
                price: 499000,
                billingCycle: 'monthly',
                tier: 'Premium',
                description: 'Cho nhóm kỹ thuật & cửa hàng nhỏ',
                badge: 'Phổ biến nhất',
                badgeColor: 'primary',
                isPopular: true,
                status: 'active',
                discount: 20,
                features: [
                    'Mọi tính năng gói Basic',
                    '3 Tài khoản người dùng',
                    'Quản lý công việc (Dispatch)',
                    'AI Smart Import không giới hạn',
                    'Báo cáo doanh thu',
                    'Hỗ trợ ưu tiên 24/7'
                ],
                limits: { maxUsers: 3, maxErrorCodes: 9999, aiQuota: 9999 }
            },
            {
                name: 'Enterprise',
                displayName: 'Gói Doanh nghiệp',
                price: 1500000,
                billingCycle: 'monthly',
                tier: 'Enterprise',
                description: 'Giải pháp toàn diện cho công ty lớn',
                badge: 'VIP',
                badgeColor: 'purple',
                isPopular: false,
                status: 'active',
                discount: 25,
                features: [
                    'Không giới hạn người dùng',
                    'Custom Branding (Logo riêng)',
                    'API Access',
                    'Dedicated Server',
                    'SLA 99.9%',
                    'Đào tạo trực tiếp'
                ],
                limits: { maxUsers: 999, maxErrorCodes: 99999, aiQuota: 99999 }
            }
        ];

        for (const plan of defaultPlans) {
            await planService.createPlan(plan);
        }

        console.log('Default plans initialized');
    }
};
