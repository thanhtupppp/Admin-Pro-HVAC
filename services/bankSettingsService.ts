import { db } from './firebaseConfig';
import { collection, getDocs, doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { BankSettings } from '../types';

const SETTINGS_DOC_ID = 'vietqr_config';

export const bankSettingsService = {
    /**
     * Lấy cấu hình VietQR hiện tại
     */
    getBankSettings: async (): Promise<BankSettings | null> => {
        try {
            const docRef = doc(db, 'settings', SETTINGS_DOC_ID);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                return { id: docSnap.id, ...docSnap.data() } as BankSettings;
            }

            // Return default settings nếu chưa có
            return {
                id: SETTINGS_DOC_ID,
                bankId: 'ICB',
                bankName: 'VietinBank',
                accountNumber: '102874563321',
                accountName: 'CONG TY CONG NGHE ADMIN PRO',
                template: 'compact2',
                isActive: true,
                updatedAt: new Date().toISOString(),
                updatedBy: 'system'
            };
        } catch (e) {
            console.error('Failed to get bank settings', e);
            return null;
        }
    },

    /**
     * Cập nhật cấu hình VietQR
     */
    updateBankSettings: async (
        settings: Omit<BankSettings, 'id' | 'updatedAt'>,
        updatedBy: string
    ): Promise<void> => {
        const docRef = doc(db, 'settings', SETTINGS_DOC_ID);
        await setDoc(docRef, {
            ...settings,
            updatedAt: new Date().toISOString(),
            updatedBy
        });
    },

    /**
     * Danh sách ngân hàng hỗ trợ VietQR
     */
    getSupportedBanks: () => {
        return [
            { id: 'ICB', name: 'VietinBank' },
            { id: 'VCB', name: 'Vietcombank' },
            { id: 'BIDV', name: 'BIDV' },
            { id: 'VBA', name: 'Agribank' },
            { id: 'TCB', name: 'Techcombank' },
            { id: 'MB', name: 'MB Bank' },
            { id: 'ACB', name: 'ACB' },
            { id: 'VPB', name: 'VPBank' },
            { id: 'TPB', name: 'TPBank' },
            { id: 'STB', name: 'Sacombank' },
            { id: 'HDB', name: 'HDBank' },
            { id: 'VCCB', name: 'VietCapitalBank' },
            { id: 'SCB', name: 'SCB' },
            { id: 'VIB', name: 'VIB' },
            { id: 'SHB', name: 'SHB' },
            { id: 'EIB', name: 'Eximbank' },
            { id: 'MSB', name: 'MSB' },
            { id: 'CAKE', name: 'CAKE by VPBank' },
            { id: 'Ubank', name: 'Ubank by VPBank' },
            { id: 'TIMO', name: 'Timo by BanViet' },
            { id: 'VIETBANK', name: 'VietBank' },
            { id: 'OCEANBANK', name: 'OceanBank' },
            { id: 'NCB', name: 'NCB' },
            { id: 'SHBVN', name: 'Shinhan Bank' },
            { id: 'ABB', name: 'ABBANK' },
            { id: 'VAB', name: 'VietABank' },
            { id: 'NAB', name: 'NamABank' },
            { id: 'PGB', name: 'PGBank' },
            { id: 'VIETBANK', name: 'VietBank' },
            { id: 'BAB', name: 'BacABank' },
            { id: 'PVCB', name: 'PVcomBank' },
            { id: 'Oceanbank', name: 'Oceanbank' },
            { id: 'BVB', name: 'BaoVietBank' },
            { id: 'SEAB', name: 'SeABank' },
            { id: 'COOPBANK', name: 'Co-opBank' },
            { id: 'LPB', name: 'LienVietPostBank' },
            { id: 'KLB', name: 'KienLongBank' },
            { id: 'KBank', name: 'KBank' },
            { id: 'KBHN', name: 'Kookmin Bank - HN Branch' },
            { id: 'KEBHANAHCM', name: 'KEB Hana – HCM Branch' },
            { id: 'KEBHANAHN', name: 'KEB Hana – Hanoi Branch' },
            { id: 'MAFC', name: 'MAFC' },
            { id: 'CITIBANK', name: 'Citibank' },
            { id: 'KBHCM', name: 'Kookmin Bank - Hochiminh Branch' },
            { id: 'VBSP', name: 'VBSP' },
            { id: 'WVN', name: 'Woori Bank' },
            { id: 'VRB', name: 'VRB' },
            { id: 'UOB', name: 'United Overseas Bank' },
            { id: 'SCVN', name: 'StandardChartered Bank' },
            { id: 'PBVN', name: 'PublicBank' },
            { id: 'NHB HN', name: 'Nonghyup Bank - HN Branch' },
            { id: 'IVB', name: 'IndovinaBank' },
            { id: 'IBK - HCM', name: 'IBK - HCM Branch' },
            { id: 'IBK - HN', name: 'IBK - Hanoi Branch' },
            { id: 'HSBC', name: 'HSBC' },
            { id: 'HLBVN', name: 'HongLeong Bank' },
            { id: 'GPB', name: 'GPBank' },
            { id: 'DOB', name: 'DongABank' },
            { id: 'DBS', name: 'DBS Bank' },
            { id: 'CIMB', name: 'CIMB' },
            { id: 'CBB', name: 'CBBank' },
        ];
    }
};
