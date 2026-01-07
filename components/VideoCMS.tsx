import React, { useState, useEffect } from 'react';
import { errorService } from '../services/errorService';
import { ErrorCode } from '../types';

interface AggregatedVideo {
    videoId: string;
    youtubeUrl: string;
    thumbnailUrl: string;
    title: string;
    errorCodes: string[]; // Error codes that use this video
}

const VideoCMS: React.FC = () => {
    const [videos, setVideos] = useState<AggregatedVideo[]>([]);
    const [errorCodes, setErrorCodes] = useState<ErrorCode[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterErrorCode, setFilterErrorCode] = useState<string>('all');

    useEffect(() => {
        loadData();
    }, []);

    // Extract YouTube video ID from URL
    const extractVideoId = (url: string): string | null => {
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
    };

    const loadData = async () => {
        setIsLoading(true);
        try {
            const errorCodesData = await errorService.getErrors();
            setErrorCodes(errorCodesData);

            // Extract and aggregate videos from error codes
            const videoMap = new Map<string, AggregatedVideo>();

            errorCodesData.forEach(errorCode => {
                if (errorCode.videos && errorCode.videos.length > 0) {
                    errorCode.videos.forEach(videoUrl => {
                        const videoId = extractVideoId(videoUrl);
                        if (videoId) {
                            if (videoMap.has(videoId)) {
                                // Video already exists, add this error code to the list
                                const existing = videoMap.get(videoId)!;
                                if (!existing.errorCodes.includes(errorCode.code)) {
                                    existing.errorCodes.push(errorCode.code);
                                }
                            } else {
                                // New video, create entry
                                videoMap.set(videoId, {
                                    videoId,
                                    youtubeUrl: videoUrl,
                                    thumbnailUrl: `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`,
                                    title: `Video hướng dẫn ${errorCode.code}`, // Placeholder title
                                    errorCodes: [errorCode.code]
                                });
                            }
                        }
                    });
                }
            });

            setVideos(Array.from(videoMap.values()));
        } catch (error) {
            console.error('Load data failed:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const filteredVideos = videos.filter(video => {
        const matchesSearch = video.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            video.errorCodes.some(code => code.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesErrorCode = filterErrorCode === 'all' || video.errorCodes.includes(filterErrorCode);
        return matchesSearch && matchesErrorCode;
    });

    const handleWatch = (video: AggregatedVideo) => {
        window.open(video.youtubeUrl, '_blank');
    };

    // Get unique error codes that have videos
    const errorCodesWithVideos = Array.from(
        new Set(errorCodes.filter(ec => ec.videos && ec.videos.length > 0).map(ec => ec.code))
    );

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
                    <h1 className="text-2xl font-semibold text-text-primary mb-1">Kho Video Hướng Dẫn</h1>
                    <p className="text-sm text-text-muted">
                        {videos.length} video từ {errorCodesWithVideos.length} mã lỗi
                    </p>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-4">
                <div className="industrial-card">
                    <div className="text-xs text-text-muted mb-1">Tổng video</div>
                    <div className="text-2xl font-mono font-semibold text-text-primary">{videos.length}</div>
                </div>
                <div className="industrial-card">
                    <div className="text-xs text-text-muted mb-1">Mã lỗi có video</div>
                    <div className="text-2xl font-mono font-semibold text-text-primary">
                        {errorCodesWithVideos.length}
                    </div>
                </div>
                <div className="industrial-card">
                    <div className="text-xs text-text-muted mb-1">Tổng mã lỗi</div>
                    <div className="text-2xl font-mono font-semibold text-text-primary">{errorCodes.length}</div>
                </div>
            </div>

            {/* Filters */}
            <div className="flex gap-4">
                <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Tìm kiếm video, mã lỗi..."
                    className="flex-1 bg-bg-soft border border-border-base rounded-lg px-4 py-2 text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand-primary/50"
                />
                <select
                    value={filterErrorCode}
                    onChange={(e) => setFilterErrorCode(e.target.value)}
                    className="bg-bg-soft border border-border-base rounded-lg px-4 py-2 text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/50"
                >
                    <option value="all">Tất cả mã lỗi</option>
                    {errorCodesWithVideos.map(code => (
                        <option key={code} value={code}>{code}</option>
                    ))}
                </select>
            </div>

            {/* Videos Table */}
            <div className="industrial-card">
                <table className="industrial-table">
                    <thead>
                        <tr>
                            <th>Thumbnail</th>
                            <th>Tiêu đề</th>
                            <th>Mã lỗi liên quan</th>
                            <th className="text-right">Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredVideos.length > 0 ? filteredVideos.map((video) => (
                            <tr key={video.videoId}>
                                <td>
                                    <img 
                                        src={video.thumbnailUrl} 
                                        alt={video.title}
                                        className="w-32 h-20 object-cover rounded-lg"
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).src = `https://img.youtube.com/vi/${video.videoId}/default.jpg`;
                                        }}
                                    />
                                </td>
                                <td className="font-medium text-text-primary">
                                    {video.title}
                                    <div className="text-xs text-text-muted mt-1 font-mono">
                                        ID: {video.videoId}
                                    </div>
                                </td>
                                <td>
                                    <div className="flex flex-wrap gap-1">
                                        {video.errorCodes.slice(0, 3).map(code => (
                                            <span key={code} className="px-2 py-0.5 bg-brand-primary/10 text-brand-primary text-xs rounded font-mono">
                                                {code}
                                            </span>
                                        ))}
                                        {video.errorCodes.length > 3 && (
                                            <span className="text-xs text-text-muted">+{video.errorCodes.length - 3}</span>
                                        )}
                                    </div>
                                </td>
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
                                <td colSpan={4} className="text-center py-12 text-text-muted">
                                    {searchTerm || filterErrorCode !== 'all'
                                        ? 'Không tìm thấy video nào'
                                        : 'Chưa có video nào. Hãy thêm video vào các mã lỗi!'}
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
