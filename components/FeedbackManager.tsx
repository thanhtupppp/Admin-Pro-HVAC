import React, { useState, useEffect } from 'react';
import { feedbackService } from '../services/feedbackService';
import { Feedback } from '../types';

const FeedbackManager: React.FC = () => {
    const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState('all');
    const [filterType, setFilterType] = useState('all');
    const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(null);
    const [replyContent, setReplyContent] = useState('');
    const [isReplying, setIsReplying] = useState(false);

    useEffect(() => {
        loadFeedbacks();
    }, []);

    const loadFeedbacks = async () => {
        setIsLoading(true);
        try {
            const data = await feedbackService.getFeedbacks();
            setFeedbacks(data);
        } catch (error) {
            console.error('Failed to load feedbacks', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleReply = async () => {
        if (!selectedFeedback || !replyContent.trim()) return;

        setIsReplying(true);
        try {
            await feedbackService.replyFeedback(selectedFeedback.id, replyContent);
            alert('Đã gửi phản hồi thành công!');
            setReplyContent('');
            setSelectedFeedback(null);
            loadFeedbacks();
        } catch (error) {
            console.error('Failed to reply', error);
            alert('Lỗi khi gửi phản hồi');
        } finally {
            setIsReplying(false);
        }
    };

    const filteredFeedbacks = feedbacks.filter(f => {
        const matchesStatus = filterStatus === 'all' || f.status === filterStatus;
        const matchesType = filterType === 'all' || f.type === filterType;
        return matchesStatus && matchesType;
    });

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending': return 'bg-yellow-500/10 text-yellow-500';
            case 'processing': return 'bg-blue-500/10 text-blue-500';
            case 'resolved': return 'bg-green-500/10 text-green-500';
            case 'closed': return 'bg-gray-500/10 text-gray-500';
            default: return 'bg-gray-500/10 text-gray-500';
        }
    };

    const getTypeLabel = (type: string) => {
        switch (type) {
            case 'general': return 'Chung';
            case 'bug': return 'Báo lỗi';
            case 'feature_request': return 'Tính năng mới';
            case 'account': return 'Tài khoản';
            default: return type;
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="text-center">
                    <div className="animate-pulse-slow text-brand-primary text-4xl mb-4">●</div>
                    <p className="text-text-secondary text-sm">Đang tải phản hồi...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6 h-full flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold text-text-primary mb-1">Hỗ trợ & Phản hồi</h1>
                    <p className="text-sm text-text-muted">{filteredFeedbacks.length} yêu cầu</p>
                </div>
                <div className="flex gap-3">
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="bg-bg-soft border border-border-base rounded-lg px-4 py-2 text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/50"
                    >
                        <option value="all">Tất cả trạng thái</option>
                        <option value="pending">Chờ xử lý</option>
                        <option value="processing">Đang xử lý</option>
                        <option value="resolved">Đã xong</option>
                    </select>
                    <button onClick={loadFeedbacks} className="p-2 hover:bg-bg-soft rounded-lg text-text-secondary">
                        <span className="material-symbols-outlined">refresh</span>
                    </button>
                </div>
            </div>

            <div className="flex gap-6 flex-1 min-h-0">
                {/* List */}
                <div className="flex-1 industrial-card flex flex-col min-h-0">
                    <div className="overflow-y-auto custom-scroll">
                        <table className="industrial-table w-full">
                            <thead className="sticky top-0 bg-bg-panel z-10">
                                <tr>
                                    <th>Thời gian</th>
                                    <th>Người người</th>
                                    <th>Loại</th>
                                    <th>Tiêu đề</th>
                                    <th>Trạng thái</th>
                                    <th>Thao tác</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredFeedbacks.map((item) => (
                                    <tr key={item.id} className="hover:bg-bg-soft/50 transition-colors">
                                        <td className="text-sm text-text-muted whitespace-nowrap">
                                            {new Date(item.createdAt).toLocaleString('vi-VN')}
                                        </td>
                                        <td>
                                            <div className="font-medium text-text-primary">{item.userName}</div>
                                            <div className="text-xs text-text-muted">{item.userEmail}</div>
                                        </td>
                                        <td>
                                            <span className="px-2 py-1 bg-bg-soft text-text-secondary text-xs rounded border border-border-base">
                                                {getTypeLabel(item.type)}
                                            </span>
                                        </td>
                                        <td className="max-w-xs truncate" title={item.title}>
                                            <div className="text-text-primary font-medium">{item.title}</div>
                                            <div className="text-xs text-text-muted truncate">{item.content}</div>
                                        </td>
                                        <td>
                                            <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(item.status)}`}>
                                                {item.status === 'pending' ? 'Chờ xử lý' :
                                                 item.status === 'processing' ? 'Đang xử lý' :
                                                 item.status === 'resolved' ? 'Đã xong' : item.status}
                                            </span>
                                        </td>
                                        <td>
                                            <button
                                                onClick={() => setSelectedFeedback(item)}
                                                className="px-3 py-1 bg-brand-primary/10 hover:bg-brand-primary text-brand-primary hover:text-white rounded text-sm font-medium transition-colors"
                                            >
                                                Xem
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Detail Panel */}
                {selectedFeedback && (
                    <div className="w-96 industrial-card flex flex-col animate-in slide-in-from-right duration-300">
                        <div className="flex items-center justify-between mb-4 pb-4 border-b border-border-base">
                            <h3 className="font-semibold text-lg text-text-primary">Chi tiết</h3>
                            <button onClick={() => setSelectedFeedback(null)} className="text-text-muted hover:text-text-primary">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        
                        <div className="flex-1 overflow-y-auto custom-scroll space-y-4 pr-2">
                            <div>
                                <label className="text-xs text-text-muted uppercase font-bold">Người gửi</label>
                                <div className="text-text-primary">{selectedFeedback.userName} ({selectedFeedback.userEmail})</div>
                            </div>
                            <div>
                                <label className="text-xs text-text-muted uppercase font-bold">Loại</label>
                                <div className="mt-1">
                                    <span className="px-2 py-1 bg-bg-soft text-text-secondary text-xs rounded border border-border-base">
                                        {getTypeLabel(selectedFeedback.type)}
                                    </span>
                                </div>
                            </div>
                            <div>
                                <label className="text-xs text-text-muted uppercase font-bold">Nội dung</label>
                                <div className="bg-bg-soft p-3 rounded-lg mt-1 text-sm text-text-primary">
                                    <div className="font-bold mb-1">{selectedFeedback.title}</div>
                                    <div className="whitespace-pre-wrap">{selectedFeedback.content}</div>
                                </div>
                            </div>

                            {selectedFeedback.adminReply && (
                                <div className="border-t border-border-base pt-4">
                                     <label className="text-xs text-green-500 uppercase font-bold flex items-center gap-1">
                                        <span className="material-symbols-outlined text-sm">check_circle</span>
                                        Đã trả lời
                                     </label>
                                     <div className="text-xs text-text-muted mb-2">Bởi {selectedFeedback.replyBy} lúc {new Date(selectedFeedback.repliedAt!).toLocaleString('vi-VN')}</div>
                                     <div className="bg-green-500/10 border border-green-500/20 p-3 rounded-lg text-sm text-text-primary">
                                        {selectedFeedback.adminReply}
                                     </div>
                                </div>
                            )}
                        </div>

                        {/* Reply Form */}
                        {!selectedFeedback.adminReply && (
                            <div className="mt-4 pt-4 border-t border-border-base">
                                <label className="text-xs text-text-muted uppercase font-bold mb-2 block">Trả lời</label>
                                <textarea
                                    className="w-full bg-bg-soft border border-border-base rounded-lg p-3 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-primary placeholder:text-text-muted mb-3"
                                    rows={4}
                                    placeholder="Nhập câu trả lời..."
                                    value={replyContent}
                                    onChange={(e) => setReplyContent(e.target.value)}
                                ></textarea>
                                <button
                                    onClick={handleReply}
                                    disabled={isReplying || !replyContent.trim()}
                                    className="w-full py-2 bg-brand-primary hover:bg-brand-primary/90 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                                >
                                    {isReplying ? (
                                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                                    ) : (
                                        <>
                                            <span className="material-symbols-outlined text-lg">send</span>
                                            Gửi phản hồi & Hoàn tất
                                        </>
                                    )}
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default FeedbackManager;
