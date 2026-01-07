/**
 * Document Tag Types
 */

export interface DocumentTag {
    id: string;
    name: string;
    color: string; // Hex color
    description?: string;
    count: number; // Number of documents with this tag
    createdBy: string;
    createdAt: string;
    updatedAt: string;
}

export interface TagStats {
    totalTags: number;
    mostUsedTag: {
        tag: DocumentTag;
        count: number;
    } | null;
    recentTags: DocumentTag[];
}
