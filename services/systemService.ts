import { ActivityEntry, SystemVersion } from '../types';
import { db } from './firebaseConfig';
import {
    collection,
    getDocs,
    doc,
    getDoc,
    setDoc,
    addDoc,
    query,
    orderBy,
    limit,
    where,
    onSnapshot,
    Timestamp,
    Unsubscribe
} from 'firebase/firestore';
import Papa from 'papaparse';

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

export interface AuditLogFilter {
    startDate?: Date;
    endDate?: Date;
    userId?: string;
    action?: string;
}

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

    /**
     * Get audit logs with real-time updates
     * @param callback - Function to call when logs update
     * @param filters - Optional filters for logs
     * @returns Unsubscribe function to stop listening
     */
    getLogsRealtime: (callback: (logs: ActivityEntry[]) => void, filters?: AuditLogFilter): Unsubscribe => {
        try {
            let q = query(collection(db, 'activity_logs'), orderBy('timestamp', 'desc'), limit(100));

            // Apply filters
            const constraints: any[] = [];

            if (filters?.startDate) {
                constraints.push(where('timestamp', '>=', Timestamp.fromDate(filters.startDate)));
            }
            if (filters?.endDate) {
                constraints.push(where('timestamp', '<=', Timestamp.fromDate(filters.endDate)));
            }
            if (filters?.userId) {
                constraints.push(where('userId', '==', filters.userId));
            }
            if (filters?.action && filters.action !== 'ALL') {
                constraints.push(where('action', '==', filters.action));
            }

            if (constraints.length > 0) {
                q = query(collection(db, 'activity_logs'), ...constraints, orderBy('timestamp', 'desc'), limit(100));
            }

            const unsubscribe = onSnapshot(q, (snapshot) => {
                const logs: ActivityEntry[] = [];
                snapshot.forEach((doc) => {
                    const data = doc.data();
                    logs.push({
                        id: doc.id,
                        ...data,
                        // Convert Firestore Timestamp to ISO string for display
                        timestamp: data.timestamp?.toDate?.()?.toISOString() || data.timestamp
                    } as ActivityEntry);
                });
                callback(logs);
            }, (error) => {
                console.error('Error listening to audit logs:', error);
                callback([]);
            });

            return unsubscribe;
        } catch (e) {
            console.error('Failed to setup realtime logs', e);
            return () => { }; // Return empty unsubscribe function
        }
    },

    /**
     * Add audit log entry
     * @param entry - Audit log entry
     */
    addAuditLog: async (entry: {
        userId: string;
        userName: string;
        action: string;
        target: string;
        details: string;
        severity?: 'info' | 'warning' | 'danger';
        ipAddress?: string;
    }): Promise<void> => {
        try {
            await addDoc(collection(db, 'activity_logs'), {
                ...entry,
                timestamp: Timestamp.now(),
                severity: entry.severity || 'info',
                ipAddress: entry.ipAddress || 'Unknown'
            });
        } catch (e) {
            console.error('Failed to add audit log', e);
        }
    },

    logActivity: async (
        action: string,
        target: string,
        details: string,
        severity: 'info' | 'warning' | 'danger' = 'info'
    ): Promise<void> => {
        try {
            const { auth } = await import('./firebaseConfig');
            const currentUser = auth.currentUser;
            
            // Try to get public IP
            let ipAddress = 'Unknown';
            try {
                const response = await fetch('https://api.ipify.org?format=json');
                if (response.ok) {
                    const data = await response.json();
                    ipAddress = data.ip;
                }
            } catch (ipError) {
                console.warn('Failed to fetch IP address:', ipError);
            }
            
            if (currentUser) {
                await systemService.addAuditLog({
                    userId: currentUser.uid,
                    userName: currentUser.email || 'Unknown',
                    action,
                    target,
                    details,
                    severity,
                    ipAddress
                });
            } else {
                 // Log system actions or anonymous actions if needed
                 await systemService.addAuditLog({
                    userId: 'system',
                    userName: 'System',
                    action,
                    target,
                    details,
                    severity,
                    ipAddress
                });
            }
        } catch (error) {
            console.error('Error logging activity:', error);
        }
    },

    /**
     * Export audit logs to CSV
     * @param logs - Logs to export
     * @param filename - Filename for download
     */
    exportLogsToCSV: (logs: ActivityEntry[], filename: string = 'audit_logs.csv'): void => {
        try {
            const csvData = logs.map(log => ({
                Timestamp: log.timestamp,
                User: log.userName,
                Action: log.action,
                Target: log.target,
                Details: log.details,
                IP: (log as any).ipAddress || 'N/A'
            }));

            const csv = Papa.unparse(csvData);
            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);

            link.setAttribute('href', url);
            link.setAttribute('download', filename);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (e) {
            console.error('Failed to export logs to CSV', e);
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
