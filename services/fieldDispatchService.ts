import { db } from './firebaseConfig';
import {
    collection,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
    getDocs,
    query,
    where,
    onSnapshot,
    Timestamp,
    orderBy
} from 'firebase/firestore';

export type JobStatus = 'scheduled' | 'en_route' | 'in_progress' | 'completed' | 'cancelled';
export type JobPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface ServiceJob {
    id?: string;
    customerId: string;
    customerName: string;
    customerPhone: string;
    address: string;
    latitude?: number;
    longitude?: number;
    technicianId: string;
    technicianName: string;
    scheduledTime: Timestamp;
    status: JobStatus;
    errorCode?: string;
    estimatedDuration: number; // minutes
    actualDuration?: number;
    notes: string;
    priority: JobPriority;
    createdAt: Timestamp;
    updatedAt: Timestamp;
    completedAt?: Timestamp;
}

/**
 * Field Dispatch Service - Quản lý công việc kỹ thuật viên
 */
export const fieldDispatchService = {
    /**
     * Thêm job mới
     */
    addJob: async (job: Omit<ServiceJob, 'id'>): Promise<string> => {
        try {
            const docRef = await addDoc(collection(db, 'serviceJobs'), {
                ...job,
                createdAt: job.createdAt || Timestamp.now(),
                updatedAt: Timestamp.now()
            });
            return docRef.id;
        } catch (error) {
            console.error('Add job failed:', error);
            throw new Error('Không thể tạo công việc.');
        }
    },

    /**
     * Lấy tất cả jobs
     */
    getJobs: async (): Promise<ServiceJob[]> => {
        try {
            const snapshot = await getDocs(
                query(collection(db, 'serviceJobs'), orderBy('scheduledTime', 'asc'))
            );
            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as ServiceJob));
        } catch (error) {
            console.error('Get jobs failed:', error);
            return [];
        }
    },

    /**
     * Lấy jobs theo technician
     */
    getJobsByTechnician: async (technicianId: string): Promise<ServiceJob[]> => {
        try {
            const q = query(
                collection(db, 'serviceJobs'),
                where('technicianId', '==', technicianId),
                where('status', '!=', 'completed'),
                orderBy('scheduledTime', 'asc')
            );
            const snapshot = await getDocs(q);
            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as ServiceJob));
        } catch (error) {
            console.error('Get jobs by technician failed:', error);
            return [];
        }
    },

    /**
     * Lắng nghe real-time updates
     */
    subscribeToJobs: (callback: (jobs: ServiceJob[]) => void) => {
        const q = query(collection(db, 'serviceJobs'), orderBy('scheduledTime', 'asc'));

        return onSnapshot(q, (snapshot) => {
            const jobs = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as ServiceJob));
            callback(jobs);
        }, (error) => {
            console.error('Jobs snapshot error:', error);
        });
    },

    /**
     * Cập nhật job status (cho drag & drop)
     */
    updateJobStatus: async (jobId: string, newStatus: JobStatus): Promise<void> => {
        try {
            const updates: any = {
                status: newStatus,
                updatedAt: Timestamp.now()
            };

            if (newStatus === 'completed') {
                updates.completedAt = Timestamp.now();
            }

            await updateDoc(doc(db, 'serviceJobs', jobId), updates);
        } catch (error) {
            console.error('Update job status failed:', error);
            throw new Error('Không thể cập nhật trạng thái.');
        }
    },

    /**
     * Gán lại job cho technician khác
     */
    reassignJob: async (jobId: string, newTechnicianId: string, newTechnicianName: string): Promise<void> => {
        try {
            await updateDoc(doc(db, 'serviceJobs', jobId), {
                technicianId: newTechnicianId,
                technicianName: newTechnicianName,
                updatedAt: Timestamp.now()
            });
        } catch (error) {
            console.error('Reassign job failed:', error);
            throw new Error('Không thể phân công lại.');
        }
    },

    /**
     * Cập nhật job
     */
    updateJob: async (jobId: string, updates: Partial<ServiceJob>): Promise<void> => {
        try {
            await updateDoc(doc(db, 'serviceJobs', jobId), {
                ...updates,
                updatedAt: Timestamp.now()
            });
        } catch (error) {
            console.error('Update job failed:', error);
            throw new Error('Không thể cập nhật công việc.');
        }
    },

    /**
     * Xóa job
     */
    deleteJob: async (jobId: string): Promise<void> => {
        try {
            await deleteDoc(doc(db, 'serviceJobs', jobId));
        } catch (error) {
            console.error('Delete job failed:', error);
            throw new Error('Không thể xóa công việc.');
        }
    }
};
