
import { db } from './firebaseConfig';
import { collection, addDoc, getDocs, doc, deleteDoc, query, orderBy, Timestamp } from 'firebase/firestore';

export interface Document {
  id: string;
  title: string;
  brand: string;
  model_series: string;
  fileId: string;
  previewUrl: string;
  type: 'manual' | 'schematic' | 'image';
  createdAt: string;
}

const COLLECTION_NAME = 'documents';

export const documentService = {
  /**
   * Add a new document to Firestore
   */
  addDocument: async (data: Omit<Document, 'id' | 'createdAt'>): Promise<string> => {
    try {
      const docRef = await addDoc(collection(db, COLLECTION_NAME), {
        ...data,
        createdAt: new Date().toISOString()
      });
      return docRef.id;
    } catch (error) {
      console.error("Error adding document:", error);
      throw error;
    }
  },

  /**
   * Get all documents ordered by creation date
   */
  getDocuments: async (): Promise<Document[]> => {
    try {
      // Create a query against the collection.
      // Note: You might need to create an index in Firestore console if this fails initially with many documents
      const q = query(collection(db, COLLECTION_NAME)); // Removing orderBy temporarily to avoid index issues on first run

      const querySnapshot = await getDocs(q);
      const documents: Document[] = [];
      querySnapshot.forEach((doc) => {
        documents.push({ id: doc.id, ...doc.data() } as Document);
      });

      // Sort client-side for now to ensure stability
      return documents.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } catch (error) {
      console.error("Error getting documents:", error);
      throw error;
    }
  },

  /**
   * Delete a document
   */
  deleteDocument: async (id: string): Promise<void> => {
    try {
      await deleteDoc(doc(db, COLLECTION_NAME, id));
    } catch (error) {
      console.error("Error deleting document:", error);
      throw error;
    }
  },

  /**
   * Upload document file to Firebase Storage and create document record
   */
  uploadDocument: async (
    file: File,
    metadata: { title: string; brand: string; model_series: string; type: 'manual' | 'schematic' | 'image' }
  ): Promise<string> => {
    try {
      // For now, we'll use a data URL as preview since Firebase Storage requires additional setup
      // In production, you would upload to Firebase Storage and get the download URL
      const reader = new FileReader();
      const dataUrlPromise = new Promise<string>((resolve) => {
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });

      const previewUrl = await dataUrlPromise;

      const docData = {
        ...metadata,
        fileId: `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        previewUrl,
        createdAt: new Date().toISOString()
      };

      const docRef = await addDoc(collection(db, COLLECTION_NAME), docData);
      return docRef.id;
    } catch (error) {
      console.error("Error uploading document:", error);
      throw error;
    }
  },

  /**
   * Update document metadata
   */
  updateDocument: async (
    id: string,
    updates: Partial<Omit<Document, 'id' | 'createdAt' | 'fileId' | 'previewUrl'>>
  ): Promise<void> => {
    try {
      const { updateDoc } = await import('firebase/firestore');
      await updateDoc(doc(db, COLLECTION_NAME, id), updates);
    } catch (error) {
      console.error("Error updating document:", error);
      throw error;
    }
  }
};
