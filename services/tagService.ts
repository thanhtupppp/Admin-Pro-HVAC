import { db } from './firebaseConfig';
import {
    collection,
    doc,
    getDocs,
    addDoc,
    updateDoc,
    deleteDoc,
    query,
    where,
    increment,
    arrayUnion,
    arrayRemove
} from 'firebase/firestore';
import { DocumentTag, TagStats } from '../types/documentTag';

/**
 * Document Tag Service
 */
export const tagService = {
    /**
     * Get all tags
     */
    getAllTags: async (): Promise<DocumentTag[]> => {
        try {
            const snapshot = await getDocs(collection(db, 'documentTags'));
            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as DocumentTag));
        } catch (error) {
            console.error('Failed to get tags:', error);
            return [];
        }
    },

    /**
     * Create tag
     */
    createTag: async (data: {
        name: string;
        color: string;
        description?: string;
        createdBy: string;
    }): Promise<DocumentTag> => {
        const now = new Date().toISOString();
        const newTag = {
            ...data,
            count: 0,
            createdAt: now,
            updatedAt: now
        };

        const docRef = await addDoc(collection(db, 'documentTags'), newTag);
        return { id: docRef.id, ...newTag } as DocumentTag;
    },

    /**
     * Update tag
     */
    updateTag: async (id: string, updates: Partial<DocumentTag>): Promise<void> => {
        const docRef = doc(db, 'documentTags', id);
        await updateDoc(docRef, {
            ...updates,
            updatedAt: new Date().toISOString()
        });
    },

    /**
     * Delete tag
     */
    deleteTag: async (id: string): Promise<void> => {
        // Remove tag from all documents first
        const docsWithTag = await tagService.getDocumentsByTag(id);

        for (const document of docsWithTag) {
            await tagService.removeTagFromDocument(document.id!, id);
        }

        // Delete tag
        await deleteDoc(doc(db, 'documentTags', id));
    },

    /**
     * Add tag to document
     */
    addTagToDocument: async (documentId: string, tagId: string): Promise<void> => {
        const docRef = doc(db, 'documents', documentId);

        // Add tag to document
        await updateDoc(docRef, {
            tags: arrayUnion(tagId),
            updatedAt: new Date().toISOString()
        });

        // Increment tag count
        const tagRef = doc(db, 'documentTags', tagId);
        await updateDoc(tagRef, {
            count: increment(1)
        });
    },

    /**
     * Remove tag from document
     */
    removeTagFromDocument: async (documentId: string, tagId: string): Promise<void> => {
        const docRef = doc(db, 'documents', documentId);

        // Remove tag from document
        await updateDoc(docRef, {
            tags: arrayRemove(tagId),
            updatedAt: new Date().toISOString()
        });

        // Decrement tag count
        const tagRef = doc(db, 'documentTags', tagId);
        await updateDoc(tagRef, {
            count: increment(-1)
        });
    },

    /**
     * Search documents by tag
     */
    getDocumentsByTag: async (tagId: string): Promise<any[]> => {
        try {
            const q = query(
                collection(db, 'documents'),
                where('tags', 'array-contains', tagId)
            );
            const snapshot = await getDocs(q);
            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
        } catch (error) {
            console.error('Failed to get documents by tag:', error);
            return [];
        }
    },

    /**
     * Get tag statistics
     */
    getTagStats: async (): Promise<TagStats> => {
        const tags = await tagService.getAllTags();

        const mostUsed = tags.reduce((max, tag) =>
            tag.count > (max?.count || 0) ? tag : max,
            null as DocumentTag | null
        );

        return {
            totalTags: tags.length,
            mostUsedTag: mostUsed ? { tag: mostUsed, count: mostUsed.count } : null,
            recentTags: tags
                .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                .slice(0, 5)
        };
    },

    /**
     * Bulk add tags to document
     */
    bulkAddTagsToDocument: async (documentId: string, tagIds: string[]): Promise<void> => {
        for (const tagId of tagIds) {
            await tagService.addTagToDocument(documentId, tagId);
        }
    },

    /**
     * Get popular tags (most used)
     */
    getPopularTags: async (limit: number = 10): Promise<DocumentTag[]> => {
        const tags = await tagService.getAllTags();
        return tags
            .sort((a, b) => b.count - a.count)
            .slice(0, limit);
    }
};
