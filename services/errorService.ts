import { ErrorCode } from '../types';
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
        return { id: docRef.id, ...newError } as ErrorCode;
    },

    updateError: async (id: string, updates: Partial<ErrorCode>): Promise<ErrorCode> => {
        const docRef = doc(db, 'error_codes', id);
        const dataToUpdate = {
            ...updates,
            updatedAt: new Date().toISOString().split('T')[0]
        };
        await updateDoc(docRef, dataToUpdate);

        // Return updated object (fetching it again or merging usage)
        return { id, ...dataToUpdate } as ErrorCode;
        // Note: Ideally we merge with existing data, but for UI return often just the updates + id is enough or we refetch.
        // Let's assume the UI updates local state with this return. 
        // A safer way is to fetch after update if we want full object, but that's 2 reads. 
        // For now, this is efficient and sufficient as long as 'updates' doesn't delete needed keys.
    },

    deleteError: async (id: string): Promise<void> => {
        await deleteDoc(doc(db, 'error_codes', id));
    }
};
