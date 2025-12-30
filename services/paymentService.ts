import { db } from './firebaseConfig';
import {
    collection,
    getDocs,
    addDoc
} from 'firebase/firestore';

export interface Plan {
    id: string;
    name: string;
    price: number;
    period: string; // 'month', 'year', 'forever'
    features: string[];
    isPopular?: boolean;
}

export interface Transaction {
    id: string;
    userId: string;
    planId: string;
    amount: number;
    status: 'pending' | 'completed' | 'failed';
    date: string;
    method: 'bank_transfer' | 'credit_card';
    description: string;
}

export const paymentService = {
    getPlans: async (): Promise<Plan[]> => {
        try {
            const querySnapshot = await getDocs(collection(db, 'plans'));
            if (querySnapshot.empty) {
                // Fallback for initial load if DB is empty
                return [
                    {
                        id: 'free',
                        name: 'Gói Miễn phí (Free)',
                        price: 0,
                        period: 'forever',
                        features: ['Tra cứu cơ bản', 'OCR 5 lần/ngày', 'Lịch sử cá nhân']
                    },
                    {
                        id: 'premium',
                        name: 'Gói Chuyên nghiệp (Premium)',
                        price: 199000,
                        period: 'month',
                        features: ['Tra cứu Full AI', 'OCR không giới hạn', 'Hỗ trợ 24/7', 'Tải tài liệu PDF'],
                        isPopular: true
                    }
                ];
            }
            const plans: Plan[] = [];
            querySnapshot.forEach((doc) => {
                plans.push({ id: doc.id, ...doc.data() } as Plan);
            });
            return plans;
        } catch (e) {
            return [];
        }
    },

    createTransaction: async (data: Omit<Transaction, 'id' | 'date'>): Promise<Transaction> => {
        const newTx = {
            ...data,
            date: new Date().toISOString()
        };
        const docRef = await addDoc(collection(db, 'transactions'), newTx);
        return { id: docRef.id, ...newTx } as Transaction;
    },

    getTransactions: async (): Promise<Transaction[]> => {
        const querySnapshot = await getDocs(collection(db, 'transactions'));
        const txs: Transaction[] = [];
        querySnapshot.forEach((doc) => {
            txs.push({ id: doc.id, ...doc.data() } as Transaction);
        });
        return txs;
    }
};
