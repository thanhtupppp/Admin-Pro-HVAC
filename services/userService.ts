import { AdminUser } from '../types';
import { db } from './firebaseConfig';
import { emailService } from './emailService';
import {
    collection,
    getDocs,
    addDoc,
    deleteDoc,
    doc,
    updateDoc,
    getDoc
} from 'firebase/firestore';

export const userService = {
    getUsers: async (): Promise<AdminUser[]> => {
        try {
            const querySnapshot = await getDocs(collection(db, 'users'));
            const users: AdminUser[] = [];
            querySnapshot.forEach((doc) => {
                users.push({ id: doc.id, ...doc.data() } as AdminUser);
            });
            return users;
        } catch (e) {
            console.error("Fetch users failed", e);
            return [];
        }
    },

    getUser: async (id: string): Promise<AdminUser | null> => {
        try {
            const docRef = doc(db, 'users', id);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                return { id: docSnap.id, ...docSnap.data() } as AdminUser;
            }
            return null;
        } catch (e) {
            console.error("Get user failed", e);
            return null;
        }
    },

    createUser: async (userData: Omit<AdminUser, 'id' | 'lastLogin' | 'avatar'>): Promise<AdminUser> => {
        const calculateAvatar = (name: string) => {
            if (!name) return '??';
            const parts = name.split('.');
            if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
            return name.substring(0, 2).toUpperCase();
        };

        const newUser = {
            ...userData,
            lastLogin: 'Chưa đăng nhập',
            avatar: calculateAvatar(userData.username),
            status: userData.status || 'active'
        };

        const docRef = await addDoc(collection(db, 'users'), newUser);
        const createdUser = { id: docRef.id, ...newUser } as AdminUser;

        // Auto send welcome email
        await emailService.sendWelcomeEmail(createdUser);

        return createdUser;
    },

    updateUser: async (id: string, updates: Partial<AdminUser>): Promise<AdminUser> => {
        const docRef = doc(db, 'users', id);
        await updateDoc(docRef, updates);
        // Optimistic return or merge
        return { id, ...updates } as AdminUser;
    },

    deleteUser: async (id: string): Promise<void> => {
        await deleteDoc(doc(db, 'users', id));
    },

    toggleStatus: async (id: string): Promise<AdminUser> => {
        const docRef = doc(db, 'users', id);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
            throw new Error('User not found');
        }

        const userData = docSnap.data() as AdminUser;
        const newStatus = userData.status === 'active' ? 'locked' : 'active';

        await updateDoc(docRef, { status: newStatus });

        return { ...userData, id: docSnap.id, status: newStatus };
    }
};
