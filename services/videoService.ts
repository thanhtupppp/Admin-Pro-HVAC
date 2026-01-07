import { db } from './firebaseConfig';
import {
    collection,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
    getDocs,
    query,
    where,
    Timestamp,
    increment
} from 'firebase/firestore';

export interface Video {
    id?: string;
    title: string;
    description: string;
    youtubeUrl: string;
    videoId: string; // Extracted from URL
    thumbnailUrl: string;
    duration: number; // seconds
    views: number;
    likes: number;
    errorCodes: string[]; // Associated error codes ['E1', 'E2']
    tags: string[];
    uploadedBy: string;
    uploadedAt: Timestamp;
    status: 'active' | 'draft' | 'archived';
    channelName?: string;
}

/**
 * Video Service - Manage tutorial videos
 */
export const videoService = {
    /**
     * Extract YouTube video ID from URL
     * Supports: youtube.com/watch?v=ID, youtu.be/ID
     */
    extractVideoId: (url: string): string | null => {
        const patterns = [
            /(?:youtube\.com\/watch\?v=)([^&]+)/,
            /(?:youtu\.be\/)([^?]+)/,
            /(?:youtube\.com\/embed\/)([^?]+)/
        ];

        for (const pattern of patterns) {
            const match = url.match(pattern);
            if (match) return match[1];
        }

        return null;
    },

    /**
     * Fetch video metadata from YouTube oEmbed API
     * @param url - YouTube URL
     */
    fetchYouTubeMetadata: async (url: string): Promise<Partial<Video>> => {
        try {
            const response = await fetch(`https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`);

            if (!response.ok) {
                throw new Error('Invalid YouTube URL');
            }

            const data = await response.json();
            const videoId = videoService.extractVideoId(url);

            if (!videoId) {
                throw new Error('Could not extract video ID');
            }

            return {
                title: data.title || '',
                thumbnailUrl: data.thumbnail_url || `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
                channelName: data.author_name || '',
                videoId
            };
        } catch (error) {
            console.error('Fetch YouTube metadata failed:', error);
            throw new Error('Không thể lấy thông tin từ YouTube. Vui lòng kiểm tra URL.');
        }
    },

    /**
     * Add new video
     */
    addVideo: async (video: Omit<Video, 'id'>): Promise<string> => {
        try {
            const docRef = await addDoc(collection(db, 'videos'), {
                ...video,
                uploadedAt: video.uploadedAt || Timestamp.now(),
                views: 0,
                likes: 0
            });
            return docRef.id;
        } catch (error) {
            console.error('Add video failed:', error);
            throw new Error('Không thể thêm video. Vui lòng thử lại.');
        }
    },

    /**
     * Get all videos
     */
    getVideos: async (): Promise<Video[]> => {
        try {
            const snapshot = await getDocs(collection(db, 'videos'));
            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as Video));
        } catch (error) {
            console.error('Get videos failed:', error);
            return [];
        }
    },

    /**
     * Get videos by error code
     */
    getVideosByErrorCode: async (errorCode: string): Promise<Video[]> => {
        try {
            const q = query(
                collection(db, 'videos'),
                where('errorCodes', 'array-contains', errorCode),
                where('status', '==', 'active')
            );
            const snapshot = await getDocs(q);
            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as Video));
        } catch (error) {
            console.error('Get videos by error code failed:', error);
            return [];
        }
    },

    /**
     * Update video
     */
    updateVideo: async (id: string, updates: Partial<Video>): Promise<void> => {
        try {
            await updateDoc(doc(db, 'videos', id), updates);
        } catch (error) {
            console.error('Update video failed:', error);
            throw new Error('Không thể cập nhật video.');
        }
    },

    /**
     * Delete video
     */
    deleteVideo: async (id: string): Promise<void> => {
        try {
            await deleteDoc(doc(db, 'videos', id));
        } catch (error) {
            console.error('Delete video failed:', error);
            throw new Error('Không thể xóa video.');
        }
    },

    /**
     * Increment view count
     */
    incrementViews: async (id: string): Promise<void> => {
        try {
            await updateDoc(doc(db, 'videos', id), {
                views: increment(1)
            });
        } catch (error) {
            console.error('Increment views failed:', error);
        }
    },

    /**
     * Toggle like
     */
    toggleLike: async (id: string, shouldIncrement: boolean): Promise<void> => {
        try {
            await updateDoc(doc(db, 'videos', id), {
                likes: shouldIncrement ? increment(1) : increment(-1)
            });
        } catch (error) {
            console.error('Toggle like failed:', error);
        }
    }
};
