import { Brand, Model } from '../types';
import { db } from './firebaseConfig';
import {
    collection,
    getDocs,
    addDoc,
    deleteDoc,
    doc,
    getDoc,
    query,
    where,
    updateDoc,
    increment
} from 'firebase/firestore';

export const brandService = {
    getBrands: async (): Promise<Brand[]> => {
        const querySnapshot = await getDocs(collection(db, 'brands'));
        const brands: Brand[] = [];
        querySnapshot.forEach((doc) => {
            brands.push({ id: doc.id, ...doc.data() } as Brand);
        });
        return brands;
    },

    getModelsByBrand: async (brandId: string): Promise<Model[]> => {
        const q = query(collection(db, 'models'), where('brandId', '==', brandId));
        const querySnapshot = await getDocs(q);
        const models: Model[] = [];
        querySnapshot.forEach((doc) => {
            models.push({ id: doc.id, ...doc.data() } as Model);
        });
        return models;
    },

    createBrand: async (brandData: Omit<Brand, 'id' | 'modelCount'>): Promise<Brand> => {
        const newBrand = {
            ...brandData,
            modelCount: 0
        };
        const docRef = await addDoc(collection(db, 'brands'), newBrand);
        return { id: docRef.id, ...newBrand };
    },

    deleteBrand: async (id: string): Promise<void> => {
        await deleteDoc(doc(db, 'brands', id));
    },

    createModel: async (modelData: Omit<Model, 'id'>): Promise<Model> => {
        const docRef = await addDoc(collection(db, 'models'), modelData);

        try {
            const brandRef = doc(db, 'brands', modelData.brandId);
            await updateDoc(brandRef, {
                modelCount: increment(1)
            });
        } catch (e) {
            console.error("Failed to update brand count", e);
        }

        return { id: docRef.id, ...modelData };
    },

    deleteModel: async (id: string): Promise<void> => {
        const modelRef = doc(db, 'models', id);
        try {
            const modelSnap = await getDoc(modelRef);
            if (modelSnap.exists()) {
                const modelData = modelSnap.data() as Model;
                const brandId = modelData.brandId;

                await deleteDoc(modelRef);

                const brandRef = doc(db, 'brands', brandId);
                await updateDoc(brandRef, {
                    modelCount: increment(-1)
                });
            } else {
                console.warn(`Model with ID ${id} not found.`);
            }
        } catch (e) {
            console.error("Failed to delete model or update brand count", e);
        }
    }
};
