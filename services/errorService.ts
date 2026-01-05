import { ErrorCode } from '../types';
import { systemService } from './systemService';
import { db } from './firebaseConfig';
import {
    collection,
    getDocs,
    addDoc,
    deleteDoc,
    doc,
    getDoc,
    updateDoc
} from 'firebase/firestore';

export const errorService = {
    getErrors: async (): Promise<ErrorCode[]> => {
        const querySnapshot = await getDocs(collection(db, 'error_codes'));
        const errors: ErrorCode[] = [];
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            // Handle Firestore Timestamp conversion if necessary
            const updatedAt = data.updatedAt && typeof data.updatedAt.toDate === 'function' 
                ? data.updatedAt.toDate().toISOString().split('T')[0] 
                : data.updatedAt;
                
            errors.push({ id: doc.id, ...data, updatedAt } as ErrorCode);
        });
        return errors;
    },

    getErrorById: async (id: string): Promise<ErrorCode | undefined> => {
        const docRef = doc(db, 'error_codes', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            const data = docSnap.data();
            const updatedAt = data.updatedAt && typeof data.updatedAt.toDate === 'function'
                ? data.updatedAt.toDate().toISOString().split('T')[0]
                : data.updatedAt;
            return { id: docSnap.id, ...data, updatedAt } as ErrorCode;
        }
        return undefined;
    },

    createError: async (errorData: Omit<ErrorCode, 'id' | 'updatedAt'>): Promise<ErrorCode> => {
        const newError = {
            ...errorData,
            updatedAt: new Date().toISOString().split('T')[0]
        };
        const docRef = await addDoc(collection(db, 'error_codes'), newError);
        
        await systemService.logActivity(
            'CREATE',
            errorData.code,
            `Đã tạo mã lỗi mới: ${errorData.code} - ${errorData.title}`,
            'info'
        );

        return { id: docRef.id, ...newError } as ErrorCode;
    },

    updateError: async (id: string, updates: Partial<ErrorCode>): Promise<ErrorCode> => {
        const docRef = doc(db, 'error_codes', id);
        const dataToUpdate = {
            ...updates,
            updatedAt: new Date().toISOString().split('T')[0]
        };
        await updateDoc(docRef, dataToUpdate);

        await systemService.logActivity(
            'UPDATE',
            updates.code || id,
            `Đã cập nhật mã lỗi: ${updates.code || id}`,
            'info'
        );

        // Return updated object (fetching it again or merging usage)
        return { id, ...dataToUpdate } as ErrorCode;
    },

    deleteError: async (id: string): Promise<void> => {
        // Fetch error before deletion to get code name for log
        const error = await errorService.getErrorById(id);
        const codeName = error?.code || id;

        await deleteDoc(doc(db, 'error_codes', id));

        await systemService.logActivity(
            'DELETE',
            codeName,
            `Đã xóa mã lỗi: ${codeName}`,
            'danger'
        );
    }
};
