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

export interface PlanFeature {
    label: string;
    enabled: boolean;
}

export interface Plan {
    id: string;
    name: string;
    displayName: string;
    price: number;
    billingCycle: 'monthly' | 'yearly' | 'lifetime';
    tier: 'Free' | 'Premium' | 'Internal';
    description: string;
    features: PlanFeature[];
    badge?: string; // "Phổ biến nhất", "Mặc định"
    badgeColor?: string; // "primary", "gray"
    popular?: boolean;
    status: 'active' | 'inactive';
    createdAt: string;
    updatedAt: string;
}

export const planService = {
    /**
     * Lấy tất cả plans
     */
    getPlans: async (): Promise<Plan[]> => {
        try {
            const q = query(collection(db, 'plans'), orderBy('price', 'asc'));
            const querySnapshot = await getDocs(q);
            const plans: Plan[] = [];

            querySnapshot.forEach((doc) => {
                plans.push({ id: doc.id, ...doc.data() } as Plan);
            });

            return plans;
        } catch (e) {
            console.error('Failed to get plans', e);
            return [];
        }
    },

    /**
     * Lấy 1 plan theo ID
     */
    getPlan: async (id: string): Promise<Plan | null> => {
        try {
            const docRef = doc(db, 'plans', id);
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

    /**
     * Tạo plan mới
     */
    createPlan: async (plan: Omit<Plan, 'id' | 'createdAt' | 'updatedAt'>): Promise<Plan> => {
        const now = new Date().toISOString();
        const newPlan: Omit<Plan, 'id'> = {
            ...plan,
            createdAt: now,
            updatedAt: now
        };

        const docRef = doc(collection(db, 'plans'));
        await setDoc(docRef, newPlan);

        return { id: docRef.id, ...newPlan };
    },

    /**
     * Cập nhật plan
     */
    updatePlan: async (id: string, updates: Partial<Plan>): Promise<Plan> => {
        const docRef = doc(db, 'plans', id);
        const now = new Date().toISOString();

        await updateDoc(docRef, {
            ...updates,
            updatedAt: now
        });

        const updatedDoc = await getDoc(docRef);
        return { id: updatedDoc.id, ...updatedDoc.data() } as Plan;
    },

    /**
     * Xóa plan (soft delete - set status = 'inactive')
     */
    deletePlan: async (id: string): Promise<void> => {
        const docRef = doc(db, 'plans', id);
        await updateDoc(docRef, {
            status: 'inactive',
            updatedAt: new Date().toISOString()
        });
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
                name: 'free',
                displayName: 'Gói Miễn phí',
                price: 0,
                billingCycle: 'lifetime',
                tier: 'Free',
                description: 'Dành cho kỹ thuật viên mới',
                badge: 'Mặc định',
                badgeColor: 'gray',
                popular: false,
                status: 'active',
                features: [
                    { label: 'Tra cứu mã lỗi cơ bản', enabled: true },
                    { label: 'Quét OCR giới hạn (5 lần/ngày)', enabled: true },
                    { label: 'Xem lịch sử lỗi cá nhân', enabled: true },
                    { label: 'Hỗ trợ kỹ thuật nâng cao', enabled: false },
                    { label: 'Tải tài liệu hướng dẫn (PDF)', enabled: false }
                ]
            },
            {
                name: 'premium',
                displayName: 'Gói Chuyên nghiệp',
                price: 199000,
                billingCycle: 'monthly',
                tier: 'Premium',
                description: 'Full quyền năng cho thợ chuyên nghiệp',
                badge: 'Phổ biến nhất',
                badgeColor: 'primary',
                popular: true,
                status: 'active',
                features: [
                    { label: 'Tra cứu toàn bộ kho mã lỗi AI', enabled: true },
                    { label: 'Quét OCR không giới hạn', enabled: true },
                    { label: 'Hỗ trợ ưu tiên từ chuyên gia 24/7', enabled: true },
                    { label: 'Tải PDF Manual bản quyền', enabled: true },
                    { label: 'Phân tích linh kiện thay thế AI', enabled: true }
                ]
            }
        ];

        for (const plan of defaultPlans) {
            await planService.createPlan(plan);
        }

        console.log('Default plans initialized');
    }
};
