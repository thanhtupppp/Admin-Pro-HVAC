import { ErrorCode } from '../types';
import { systemService } from './systemService';
import { brandService } from './brandService';
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

/**
 * Ensure brand exists in brands collection
 * Auto-creates if not found
 */
const ensureBrandExists = async (brandName: string): Promise<string | null> => {
    if (!brandName || brandName.trim() === '') return null;

    try {
        const brands = await brandService.getBrands();
        let brand = brands.find(b => b.name.toLowerCase() === brandName.toLowerCase());

        if (!brand) {
            brand = await brandService.createBrand({
                name: brandName,
                logo: '' // Default empty logo
            });
            console.log(`Auto-created brand: ${brandName}`);
        }

        return brand.id;
    } catch (error) {
        console.error('Failed to ensure brand exists:', error);
        return null;
    }
};

/**
 * Ensure model exists in models collection
 * Auto-creates if not found
 */
const ensureModelExists = async (brandName: string, modelName: string): Promise<void> => {
    if (!modelName || modelName.trim() === '' || !brandName || brandName.trim() === '') return;

    try {
        // First ensure brand exists and get its ID
        const brandId = await ensureBrandExists(brandName);
        if (!brandId) return;

        // Check if model exists
        const models = await brandService.getModelsByBrand(brandId);
        const modelExists = models.some(m => m.name.toLowerCase() === modelName.toLowerCase());

        if (!modelExists) {
            await brandService.createModel({
                brandId,
                name: modelName,
                type: 'HVAC', // Default type
                notes: ''
            });
            console.log(`Auto-created model: ${modelName} for brand: ${brandName}`);
        }
    } catch (error) {
        console.error('Failed to ensure model exists:', error);
    }
};

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
        // Auto-create brand and model if not exists
        await ensureBrandExists(errorData.brand);
        await ensureModelExists(errorData.brand, errorData.model);

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
        // Auto-create brand and model if not exists
        if (updates.brand) {
            await ensureBrandExists(updates.brand);
            if (updates.model) {
                await ensureModelExists(updates.brand, updates.model);
            }
        }

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
