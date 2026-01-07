import React, { useState, useEffect } from 'react';
import { videoService, Video } from '../services/videoService';
import { errorService } from '../services/errorService';
import { ErrorCode } from '../types';

const VideoCMS: React.FC = () => {
    const [videos, setVideos] = useState<Video[]>([]);
    const [errorCodes, setErrorCodes] = useState<ErrorCode[]>([]);
    const [isLoading, setIsLoading] = useState(true);
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

    const allTags = Array.from(new Set(videos.flatMap(v => v.tags)));

    const filteredVideos = videos.filter(video => {
        const matchesSearch = video.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            video.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesTag = filterTag === 'all' || video.tags.includes(filterTag);
        return matchesSearch && matchesTag && video.status === 'active';
    });

    const handleWatch = (video: Video) => {
        window.open(video.youtubeUrl, '_blank');
        videoService.incrementViews(video.id!);
        loadData();
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="text-center">
                    <div className="animate-pulse-slow text-brand-primary text-4xl mb-4">●</div>
                    <p className="text-text-secondary text-sm">Đang tải dữ liệu...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold text-text-primary mb-1">Video CMS</h1>
                    <p className="text-sm text-text-muted">{videos.length} video hướng dẫn sửa chữa</p>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-4 gap-4">
                <div className="industrial-card">
                    <div className="text-xs text-text-muted mb-1">Tổng video</div>
                    <div className="text-2xl font-mono font-semibold text-text-primary">{videos.length}</div>
                </div>
                <div className="industrial-card">
                    <div className="text-xs text-text-muted mb-1">Lượt xem</div>
                    <div className="text-2xl font-mono font-semibold text-text-primary">
                        {videos.reduce((sum, v) => sum + v.views, 0).toLocaleString()}
                    </div>
                </div>
                <div className="industrial-card">
                    <div className="text-xs text-text-muted mb-1">Lượt thích</div>
                    <div className="text-2xl font-mono font-semibold text-text-primary">
                        {videos.reduce((sum, v) => sum + v.likes, 0).toLocaleString()}
                    </div>
                </div>
                <div className="industrial-card">
                    <div className="text-xs text-text-muted mb-1">Tags</div>
                    <div className="text-2xl font-mono font-semibold text-text-primary">{allTags.length}</div>
                </div>
            </div>

            {/* Filters */}
            <div className="flex gap-4">
                <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Tìm kiếm video..."
                    className="flex-1 bg-bg-soft border border-border-base rounded-lg px-4 py-2 text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand-primary/50"
                />
                <select
                    value={filterTag}
                    onChange={(e) => setFilterTag(e.target.value)}
                    className="bg-bg-soft border border-border-base rounded-lg px-4 py-2 text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/50"
                >
                    <option value="all">Tất cả tag</option>
                    {allTags.map(tag => (
                        <option key={tag} value={tag}>{tag}</option>
                    ))}
                </select>
            </div>

            {/* Videos Table */}
            <div className="industrial-card">
                <table className="industrial-table">
                    <thead>
                        <tr>
                            <th>Tiêu đề</th>
                            <th>Tags</th>
                            <th>Mã lỗi</th>
                            <th>Lượt xem</th>
                            <th>Thích</th>
                            <th className="text-right">Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredVideos.length > 0 ? filteredVideos.map((video) => (
                            <tr key={video.id}>
                                <td className="font-medium text-text-primary">{video.title}</td>
                                <td>
                                    <div className="flex flex-wrap gap-1">
                                        {video.tags.slice(0, 2).map(tag => (
                                            <span key={tag} className="px-2 py-0.5 bg-brand-primary/10 text-brand-primary text-xs rounded">
                                                {tag}
                                            </span>
                                        ))}
                                        {video.tags.length > 2 && (
                                            <span className="text-xs text-text-muted">+{video.tags.length - 2}</span>
                                        )}
                                    </div>
                                </td>
                                <td className="text-text-secondary text-sm font-mono">
                                    {video.errorCodes.slice(0, 2).join(', ')}
                                    {video.errorCodes.length > 2 && ` +${video.errorCodes.length - 2}`}
                                </td>
                                <td className="font-mono text-text-muted">{video.views}</td>
                                <td className="font-mono text-text-muted">{video.likes}</td>
                                <td className="text-right">
                                    <button
                                        onClick={() => handleWatch(video)}
                                        className="text-text-secondary hover:text-brand-primary transition-colors"
                                        title="Xem video"
                                    >
                                        <span className="material-symbols-outlined text-xl">play_circle</span>
                                    </button>
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan={6} className="text-center py-12 text-text-muted">
                                    {searchTerm || filterTag !== 'all'
                                        ? 'Không tìm thấy video nào'
                                        : 'Chưa có video nào'}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default VideoCMS;
