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
        const querySnapshot = await getDocs(collection(db, 'errors'));
        const errors: ErrorCode[] = [];
        querySnapshot.forEach((doc) => {
            errors.push({ id: doc.id, ...doc.data() } as ErrorCode);
        });
        return errors;
    },

    getErrorById: async (id: string): Promise<ErrorCode | undefined> => {
        const docRef = doc(db, 'errors', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            return { id: docSnap.id, ...docSnap.data() } as ErrorCode;
        }
        return undefined;
    },

    createError: async (errorData: Omit<ErrorCode, 'id' | 'updatedAt'>): Promise<ErrorCode> => {
        const newError = {
            ...errorData,
            updatedAt: new Date().toISOString().split('T')[0]
        };
        const docRef = await addDoc(collection(db, 'errors'), newError);
        return { id: docRef.id, ...newError };
    },

    updateError: async (id: string, updates: Partial<ErrorCode>): Promise<ErrorCode> => {
        const docRef = doc(db, 'errors', id);
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
        await deleteDoc(doc(db, 'errors', id));
    }
};
