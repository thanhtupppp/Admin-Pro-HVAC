import QRCode from 'qrcode';
import { db } from './firebaseConfig';
import { collection, addDoc, updateDoc, doc, Timestamp, getDoc } from 'firebase/firestore';

export interface VietQRPayment {
    accountNo: string;
    accountName: string;
    bankId: string; // 'VCB', 'TCB', 'MB', 'ACB', etc.
    bankName: string;
    amount: number;
    description: string; // Payment code: PAY{userId}{timestamp}
}

export interface PaymentTransaction {
    id?: string;
    userId: string;
    userEmail: string;
    planId: string;
    planName: string;
    amount: number;
    currency: string;
    method: 'vietqr' | 'momo' | 'zalopay';
    status: 'pending' | 'completed' | 'failed' | 'rejected';
    paymentCode: string;
    qrCodeUrl?: string;
    createdAt: Timestamp;
    updatedAt: Timestamp;
    verifiedAt?: Timestamp;
    verifiedBy?: string;
}

// Vietnam Bank IDs
export const VIETNAM_BANKS = [
    { id: 'VCB', name: 'Vietcombank', bin: '970436' },
    { id: 'TCB', name: 'Techcombank', bin: '970407' },
    { id: 'MB', name: 'MB Bank', bin: '970422' },
    { id: 'ACB', name: 'ACB', bin: '970416' },
    { id: 'VTB', name: 'VietinBank', bin: '970415' },
    { id: 'BIDV', name: 'BIDV', bin: '970418' },
    { id: 'AGR', name: 'Agribank', bin: '970405' },
    { id: 'SCB', name: 'Sacombank', bin: '970403' },
];

/**
 * Payment Gateway Service - VietQR Integration
 */
export const paymentGatewayService = {
    /**
     * Generate VietQR code for bank transfer
     * @param payment - Payment details
     * @returns QR code data URL
     */
    generateVietQR: async (payment: VietQRPayment): Promise<string> => {
        try {
            const bank = VIETNAM_BANKS.find(b => b.id === payment.bankId);
            if (!bank) {
                throw new Error('Invalid bank ID');
            }

            // VietQR format according to NAPAS standard
            // Format: 00020101021238{length}{bin}011{accountNo}...
            const accountNoLength = payment.accountNo.length.toString().padStart(2, '0');
            const binLength = bank.bin.length.toString().padStart(2, '0');

            const qrContent = `00020101021238${binLength}${bank.bin}01${accountNoLength}${payment.accountNo}0208QRIBFTTA53037045802VN62${payment.description.length.toString().padStart(2, '0')}${payment.description}6304`;

            // Generate QR code
            const qrDataURL = await QRCode.toDataURL(qrContent, {
                width: 400,
                margin: 2,
                color: {
                    dark: '#000000',
                    light: '#FFFFFF'
                },
                errorCorrectionLevel: 'M'
            });

            return qrDataURL;
        } catch (error) {
            console.error('Generate VietQR failed:', error);
            throw new Error('Không thể tạo mã QR. Vui lòng thử lại.');
        }
    },

    /**
     * Create payment transaction
     * @param transaction - Transaction details
     * @returns Transaction ID
     */
    createTransaction: async (
        userId: string,
        userEmail: string,
        planId: string,
        planName: string,
        amount: number
    ): Promise<string> => {
        try {
            // Generate unique payment code
            const timestamp = Date.now();
            const paymentCode = `PAY${userId.substring(0, 6).toUpperCase()}${timestamp}`;

            // Create transaction
            const txnData: Omit<PaymentTransaction, 'id'> = {
                userId,
                userEmail,
                planId,
                planName,
                amount,
                currency: 'VND',
                method: 'vietqr',
                status: 'pending',
                paymentCode,
                createdAt: Timestamp.now(),
                updatedAt: Timestamp.now()
            };

            const docRef = await addDoc(collection(db, 'transactions'), txnData);
            return docRef.id;
        } catch (error) {
            console.error('Create transaction failed:', error);
            throw new Error('Không thể tạo giao dịch. Vui lòng thử lại.');
        }
    },

    /**
     * Confirm payment (admin action)
     * @param transactionId - Transaction ID
     * @param adminId - Admin user ID
     */
    confirmPayment: async (transactionId: string, adminId: string): Promise<void> => {
        try {
            const txnRef = doc(db, 'transactions', transactionId);
            const txnSnap = await getDoc(txnRef);

            if (!txnSnap.exists()) {
                throw new Error('Transaction not found');
            }

            const txnData = txnSnap.data() as PaymentTransaction;

            if (txnData.status !== 'pending') {
                throw new Error('Transaction is not pending');
            }

            // Update transaction status
            await updateDoc(txnRef, {
                status: 'completed',
                verifiedAt: Timestamp.now(),
                verifiedBy: adminId,
                updatedAt: Timestamp.now()
            });

            // Upgrade user plan
            await paymentGatewayService.upgradeUserPlan(txnData.userId, txnData.planId);
        } catch (error) {
            console.error('Confirm payment failed:', error);
            throw error;
        }
    },

    /**
     * Reject payment (admin action)
     * @param transactionId - Transaction ID
     * @param adminId - Admin user ID
     */
    rejectPayment: async (transactionId: string, adminId: string): Promise<void> => {
        try {
            await updateDoc(doc(db, 'transactions', transactionId), {
                status: 'rejected',
                verifiedAt: Timestamp.now(),
                verifiedBy: adminId,
                updatedAt: Timestamp.now()
            });
        } catch (error) {
            console.error('Reject payment failed:', error);
            throw error;
        }
    },

    /**
     * Upgrade user plan after payment confirmation
     * @param userId - User ID
     * @param planId - Plan ID
     */
    upgradeUserPlan: async (userId: string, planId: string): Promise<void> => {
        try {
            const userRef = doc(db, 'users', userId);

            // Calculate expiry date (30 days for monthly, 365 for yearly)
            const expiryDate = new Date();
            expiryDate.setDate(expiryDate.getDate() + 30); // Default monthly

            await updateDoc(userRef, {
                plan: planId,
                planExpiresAt: expiryDate.toISOString(),
                updatedAt: Timestamp.now()
            });
        } catch (error) {
            console.error('Upgrade user plan failed:', error);
            throw error;
        }
    }
};
