import React, { useState, useEffect } from 'react';
import { videoService, Video } from '../services/videoService';
import { errorService } from '../services/errorService';
import { ErrorCode } from '../types';

const VideoCMS: React.FC = () => {
    const [videos, setVideos] = useState<Video[]>([]);
    const [errorCodes, setErrorCodes] = useState<ErrorCode[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterTag, setFilterTag] = useState<string>('all');

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setIsLoading(true);
        try {
            const [videosData, errorCodesData] = await Promise.all([
                videoService.getVideos(),
                errorService.getErrors()
            ]);
            setVideos(videosData);
            setErrorCodes(errorCodesData);
        } catch (error) {
            console.error('Load data failed:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // Get all unique tags
    const allTags = Array.from(new Set(videos.flatMap(v => v.tags)));

    // Filter videos
    const filteredVideos = videos.filter(video => {
        const matchesSearch = video.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            video.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesTag = filterTag === 'all' || video.tags.includes(filterTag);
        return matchesSearch && matchesTag && video.status === 'active';
    });

    return (
        <div className="p-6 space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">Video CMS</h1>
                    <p className="text-text-secondary text-sm mt-1">
                        Quản lý video hướng dẫn sửa chữa
                    </p>
                </div>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="px-4 py-2 bg-primary hover:bg-primary-hover text-white font-bold rounded-xl flex items-center gap-2"
                >
                    <span className="material-symbols-outlined text-[18px]">add</span>
                    Thêm Video
                </button>
            </div>

            {/* Search & Filter */}
            <div className="flex gap-4">
                <div className="flex-1 relative">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary">
                        search
                    </span>
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Tìm kiếm video..."
                        className="w-full bg-surface-dark border border-border-dark rounded-xl pl-12 pr-4 py-3 text-white focus:ring-1 focus:ring-primary outline-none"
                    />
                </div>
                <select
                    value={filterTag}
                    onChange={(e) => setFilterTag(e.target.value)}
                    className="bg-surface-dark border border-border-dark rounded-xl px-4 py-3 text-white focus:ring-1 focus:ring-primary outline-none"
                >
                    <option value="all">Tất cả tag</option>
                    {allTags.map(tag => (
                        <option key={tag} value={tag}>{tag}</option>
                    ))}
                </select>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-4">
                {[
                    { label: 'Tổng video', value: videos.length, icon: 'video_library', color: 'blue' },
                    { label: 'Lượt xem', value: videos.reduce((sum, v) => sum + v.views, 0).toLocaleString(), icon: 'visibility', color: 'green' },
                    { label: 'Lượt thích', value: videos.reduce((sum, v) => sum + v.likes, 0).toLocaleString(), icon: 'thumb_up', color: 'red' },
                    { label: 'Tags', value: allTags.length, icon: 'tag', color: 'purple' }
                ].map((stat, i) => (
                    <div key={i} className="bg-surface-dark border border-border-dark/50 rounded-xl p-4">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs text-text-secondary uppercase">{stat.label}</span>
                            <span className={`material-symbols-outlined text-${stat.color}-500`}>{stat.icon}</span>
                        </div>
                        <p className="text-2xl font-bold text-white">{stat.value}</p>
                    </div>
                ))}
            </div>

            {/* Video Grid */}
            {isLoading ? (
                <div className="grid grid-cols-3 gap-4">
                    {Array(6).fill(0).map((_, i) => (
                        <div key={i} className="bg-surface-dark rounded-2xl animate-pulse">
                            <div className="aspect-video bg-background-dark rounded-t-2xl"></div>
                            <div className="p-4 space-y-2">
                                <div className="h-4 bg-background-dark rounded"></div>
                                <div className="h-3 bg-background-dark rounded w-3/4"></div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : filteredVideos.length === 0 ? (
                <div className="bg-surface-dark border border-border-dark/50 rounded-2xl p-12 text-center">
                    <span className="material-symbols-outlined text-6xl text-text-secondary/30">
                        video_library
                    </span>
                    <p className="text-text-secondary mt-4">
                        {searchTerm || filterTag !== 'all' ? 'Không tìm thấy video nào' : 'Chưa có video nào'}
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredVideos.map(video => (
                        <VideoCard
                            key={video.id}
                            video={video}
                            errorCodes={errorCodes}
                            onUpdate={loadData}
                        />
                    ))}
                </div>
            )}

            {/* Add Video Modal */}
            {showAddModal && (
                <AddVideoModal
                    errorCodes={errorCodes}
                    onClose={() => setShowAddModal(false)}
                    onSuccess={() => {
                        setShowAddModal(false);
                        loadData();
                    }}
                />
            )}
        </div>
    );
};

// Video Card Component
const VideoCard: React.FC<{ video: Video; errorCodes: ErrorCode[]; onUpdate: () => void }> = ({
    video,
    errorCodes,
    onUpdate
}) => {
    const handleWatch = () => {
        window.open(video.youtubeUrl, '_blank');
        videoService.incrementViews(video.id!);
        onUpdate();
    };

    return (
        <div className="bg-surface-dark border border-border-dark/50 rounded-2xl overflow-hidden hover:border-primary/20 transition-all group">
            {/* Thumbnail */}
            <div className="relative aspect-video bg-background-dark overflow-hidden cursor-pointer" onClick={handleWatch}>
                <img
                    src={video.thumbnailUrl}
                    alt={video.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="material-symbols-outlined text-white text-6xl">play_circle</span>
                </div>
            </div>

            {/* Content */}
            <div className="p-4">
                <h3 className="font-bold text-white mb-2 line-clamp-2">{video.title}</h3>
                <p className="text-xs text-text-secondary mb-3 line-clamp-2">{video.description}</p>

                {/* Tags */}
                <div className="flex flex-wrap gap-1 mb-3">
                    {video.tags.slice(0, 3).map(tag => (
                        <span key={tag} className="px-2 py-0.5 bg-primary/10 text-primary text-[10px] font-bold rounded-full">
                            {tag}
                        </span>
                    ))}
                </div>

                {/* Error Codes */}
                {video.errorCodes.length > 0 && (
                    <div className="mb-3">
                        <p className="text-[10px] text-text-secondary uppercase mb-1">Liên quan:</p>
                        <div className="flex flex-wrap gap-1">
                            {video.errorCodes.map(code => (
                                <span key={code} className="px-2 py-0.5 bg-blue-500/10 text-blue-400 text-[10px] font-bold rounded border border-blue-500/20">
                                    {code}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {/* Stats */}
                <div className="flex items-center justify-between text-xs text-text-secondary">
                    <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-[14px]">visibility</span>
                            {video.views}
                        </span>
                        <span className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-[14px]">thumb_up</span>
                            {video.likes}
                        </span>
                    </div>
                    <span>{new Date(video.uploadedAt.toDate()).toLocaleDateString('vi-VN')}</span>
                </div>
            </div>
        </div>
    );
};

// Add Video Modal Component
const AddVideoModal: React.FC<{
    errorCodes: ErrorCode[];
    onClose: () => void;
    onSuccess: () => void;
}> = ({ errorCodes, onClose, onSuccess }) => {
    const [youtubeUrl, setYoutubeUrl] = useState('');
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [tags, setTags] = useState<string[]>([]);
    const [selectedErrorCodes, setSelectedErrorCodes] = useState<string[]>([]);
    const [tagInput, setTagInput] = useState('');
    const [isFetching, setIsFetching] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [thumbnailUrl, setThumbnailUrl] = useState('');
    const [videoId, setVideoId] = useState('');

    const handleFetchMetadata = async () => {
        if (!youtubeUrl) return;

        setIsFetching(true);
        try {
            const metadata = await videoService.fetchYouTubeMetadata(youtubeUrl);
            setTitle(metadata.title || '');
            setThumbnailUrl(metadata.thumbnailUrl || '');
            setVideoId(metadata.videoId || '');
        } catch (error: any) {
            alert(error.message);
        } finally {
            setIsFetching(false);
        }
    };

    const handleAddTag = () => {
        if (tagInput && !tags.includes(tagInput)) {
            setTags([...tags, tagInput]);
            setTagInput('');
        }
    };

    const handleSave = async () => {
        if (!title || !youtubeUrl || !videoId) {
            alert('Vui lòng điền đầy đủ thông tin');
            return;
        }

        setIsSaving(true);
        try {
            const currentUser = { uid: 'admin', email: 'admin@example.com' }; // TODO: Get from auth

            await videoService.addVideo({
                title,
                description,
                youtubeUrl,
                videoId,
                thumbnailUrl,
                duration: 0,
                views: 0,
                likes: 0,
                errorCodes: selectedErrorCodes,
                tags,
                uploadedBy: currentUser.uid,
                uploadedAt: new Date() as any,
                status: 'active'
            });

            onSuccess();
        } catch (error: any) {
            alert(error.message);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-surface-dark border border-border-dark rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <h2 className="text-xl font-bold text-white mb-6">Thêm Video Mới</h2>

                <div className="space-y-4">
                    {/* YouTube URL */}
                    <div>
                        <label className="text-xs font-bold text-text-secondary uppercase block mb-2">
                            YouTube URL
                        </label>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={youtubeUrl}
                                onChange={(e) => setYoutubeUrl(e.target.value)}
                                placeholder="https://www.youtube.com/watch?v=..."
                                className="flex-1 bg-background-dark border border-border-dark rounded-xl px-4 py-3 text-white"
                            />
                            <button
                                onClick={handleFetchMetadata}
                                disabled={isFetching}
                                className="px-4 py-3 bg-primary/10 hover:bg-primary/20 text-primary rounded-xl font-bold disabled:opacity-50"
                            >
                                {isFetching ? 'Đang tải...' : 'Lấy thông tin'}
                            </button>
                        </div>
                    </div>

                    {/* Title */}
                    <div>
                        <label className="text-xs font-bold text-text-secondary uppercase block mb-2">
                            Tiêu đề
                        </label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full bg-background-dark border border-border-dark rounded-xl px-4 py-3 text-white"
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <label className="text-xs font-bold text-text-secondary uppercase block mb-2">
                            Mô tả
                        </label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={3}
                            className="w-full bg-background-dark border border-border-dark rounded-xl px-4 py-3 text-white resize-none"
                        />
                    </div>

                    {/* Tags */}
                    <div>
                        <label className="text-xs font-bold text-text-secondary uppercase block mb-2">
                            Tags
                        </label>
                        <div className="flex gap-2 mb-2">
                            <input
                                type="text"
                                value={tagInput}
                                onChange={(e) => setTagInput(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                                placeholder="VD: máy lạnh, bảo trì..."
                                className="flex-1 bg-background-dark border border-border-dark rounded-xl px-4 py-3 text-white"
                            />
                            <button
                                onClick={handleAddTag}
                                className="px-4 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl"
                            >
                                Thêm
                            </button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {tags.map(tag => (
                                <span key={tag} className="px-3 py-1 bg-primary/10 text-primary text-sm rounded-full flex items-center gap-2">
                                    {tag}
                                    <button onClick={() => setTags(tags.filter(t => t !== tag))}>
                                        <span className="material-symbols-outlined text-[14px]">close</span>
                                    </button>
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Error Codes */}
                    <div>
                        <label className="text-xs font-bold text-text-secondary uppercase block mb-2">
                            Mã lỗi liên quan
                        </label>
                        <select
                            multiple
                            value={selectedErrorCodes}
                            onChange={(e) => setSelectedErrorCodes(Array.from(e.target.selectedOptions, (opt: HTMLOptionElement) => opt.value))}
                            className="w-full bg-background-dark border border-border-dark rounded-xl px-4 py-3 text-white h-32"
                        >
                            {errorCodes.map(ec => (
                                <option key={ec.id} value={ec.code}>
                                    {ec.code} - {ec.title}
                                </option>
                            ))}
                        </select>
                        <p className="text-xs text-text-secondary mt-1">Giữ Ctrl để chọn nhiều</p>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-4">
                        <button
                            onClick={handleSave}
                            disabled={isSaving}
                            className="flex-1 py-3 bg-primary hover:bg-primary-hover text-white font-bold rounded-xl disabled:opacity-50"
                        >
                            {isSaving ? 'Đang lưu...' : 'Lưu Video'}
                        </button>
                        <button
                            onClick={onClose}
                            className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-white font-bold rounded-xl"
                        >
                            Hủy
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VideoCMS;
