import { ActivityEntry, SystemVersion } from '../types';
import { db } from './firebaseConfig';
import {
    collection,
    getDocs,
    doc,
    getDoc,
    setDoc,
    query,
    orderBy,
    limit,
    addDoc
} from 'firebase/firestore';

export interface SystemSettings {
    appName: string;
    maintenanceMode: boolean;
    aiBudget: number;
    aiModel: string;
    geminiApiKey?: string; // Optional, stored securely in Firestore
}

const DEFAULT_SETTINGS: SystemSettings = {
    appName: 'Admin Pro Console',
    maintenanceMode: false,
    aiBudget: 32768,
    aiModel: 'gemini-2.5-flash',
    geminiApiKey: ''
};

export const systemService = {
    getLogs: async (): Promise<ActivityEntry[]> => {
        try {
            const q = query(collection(db, 'activity_logs'), orderBy('timestamp', 'desc'), limit(50));
            const querySnapshot = await getDocs(q);
            const logs: ActivityEntry[] = [];
            querySnapshot.forEach((doc) => {
                logs.push({ id: doc.id, ...doc.data() } as ActivityEntry);
            });
            return logs;
        } catch (e) {
            console.error("Failed to fetch logs", e);
            return [];
        }
    },

    logActivity: async (
        action: 'CREATE' | 'UPDATE' | 'DELETE' | 'SYSTEM' | 'LOGIN',
        target: string,
        details: string,
        severity: 'info' | 'warning' | 'danger' = 'info'
    ): Promise<void> => {
        try {
            // In a real app, get current user from Auth Context
            // For now, we simulate a mock admin user
            const mockUser = { id: 'admin_01', name: 'Admin User' };
            
            const newLog: Omit<ActivityEntry, 'id'> = {
                userId: mockUser.id,
                userName: mockUser.name,
                action,
                target,
                details,
                timestamp: new Date().toISOString(), // Consider serverTimestamp() for consistency
                severity
            };

            await addDoc(collection(db, 'activity_logs'), newLog);
        } catch (e) {
            console.error("Failed to log activity", e);
        }
    },

    checkForUpdates: async (): Promise<SystemVersion> => {
        // This typically calls an external API or checks a "releases" collection
        // Keeping mock for now as it's an external system simulation
        return new Promise((resolve) => {
            setTimeout(() => {
                const hasUpdate = Math.random() > 0.3;
                if (hasUpdate) {
                    resolve({
                        version: 'v3.5.0-beta',
                        releaseDate: '2024-03-15',
                        changes: [
                            'Tích hợp Gemini 1.5 Pro cho khả năng xử lý PDF dài hơn.',
                            'Thêm tính năng xuất báo cáo Excel cho Manager.',
                            'Vá lỗi bảo mật trong module Auth.'
                        ],
                        isCritical: false
                    });
                } else {
                    resolve({
                        version: 'v3.2.0-stable',
                        releaseDate: '2023-12-20',
                        changes: [],
                        isCritical: false
                    });
                }
            }, 1000);
        });
    },

    getSettings: async (): Promise<SystemSettings> => {
        try {
            const docRef = doc(db, 'settings', 'global');
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                return docSnap.data() as SystemSettings;
            }
            // Initialize if not exists
            await setDoc(docRef, DEFAULT_SETTINGS);
            return DEFAULT_SETTINGS;
        } catch (e) {
            console.error("Failed to load settings, using default", e);
            return DEFAULT_SETTINGS;
        }
    },

    updateSettings: async (newSettings: Partial<SystemSettings>): Promise<SystemSettings> => {
        const docRef = doc(db, 'settings', 'global');
        // Merge update
        await setDoc(docRef, newSettings, { merge: true });

        // Return full updated settings (requires fetch or local merge)
        // For simplicity, fetching valid state:
        const docSnap = await getDoc(docRef);
        return docSnap.data() as SystemSettings;
    }
};
