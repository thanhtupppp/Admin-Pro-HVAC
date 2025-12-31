
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
  }
};
