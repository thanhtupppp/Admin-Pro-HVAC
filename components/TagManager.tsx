import React, { useState, useEffect } from 'react';
import { tagService } from '../services/tagService';
import { DocumentTag } from '../types/documentTag';

const TagManager: React.FC = () => {
    const [tags, setTags] = useState<DocumentTag[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showDialog, setShowDialog] = useState(false);
    const [editingTag, setEditingTag] = useState<DocumentTag | null>(null);
    const [selectedColor, setSelectedColor] = useState('#3B82F6');

    const predefinedColors = [
        '#3B82F6', // Blue
        '#10B981', // Green
        '#F59E0B', // Orange
        '#EF4444', // Red
        '#8B5CF6', // Purple
        '#EC4899', // Pink
        '#14B8A6', // Teal
        '#F97316', // Deep Orange
        '#6366F1', // Indigo
        '#84CC16'  // Lime
    ];

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        color: '#3B82F6'
    });

    useEffect(() => {
        loadTags();
    }, []);

    const loadTags = async () => {
        setIsLoading(true);
        try {
            const data = await tagService.getAllTags();
            setTags(data.sort((a, b) => b.count - a.count));
        } catch (error) {
            console.error('Cannot load tags', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            if (editingTag) {
                await tagService.updateTag(editingTag.id, {
                    name: formData.name,
                    description: formData.description,
                    color: formData.color
                });
            } else {
                await tagService.createTag({
                    ...formData,
                    createdBy: 'current-user-id' // Replace with actual user
                });
            }

            resetForm();
            loadTags();
            alert(editingTag ? 'Đã cập nhật tag' : 'Đã tạo tag mới');
        } catch (error) {
            alert('Có lỗi xảy ra');
        }
    };

    const handleEdit = (tag: DocumentTag) => {
        setEditingTag(tag);
        setFormData({
            name: tag.name,
            description: tag.description || '',
            color: tag.color
        });
        setSelectedColor(tag.color);
        setShowDialog(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Xóa tag này? Tag sẽ bị xóa khỏi tất cả documents.')) return;

        try {
            await tagService.deleteTag(id);
            loadTags();
        } catch (error) {
            alert('Không thể xóa tag');
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            description: '',
            color: '#3B82F6'
        });
        setSelectedColor('#3B82F6');
        setEditingTag(null);
        setShowDialog(false);
    };

    if (isLoading) {
        return (
            <div className="p-6">
                <div className="text-center py-16">
                    <span className="material-symbols-outlined animate-spin text-4xl text-primary">
                        progress_activity
                    </span>
                    <p className="text-text-secondary mt-4">Đang tải...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white mb-2">Document Tags</h1>
                    <p className="text-text-secondary">Quản lý tags để phân loại documents</p>
                </div>
                <button
                    onClick={() => setShowDialog(true)}
                    className="px-6 py-3 bg-primary hover:bg-primary-hover text-white font-bold rounded-xl transition-all flex items-center gap-2"
                >
                    <span className="material-symbols-outlined">add</span>
                    Tạo tag
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-4">
                <div className="bg-surface-dark border border-border-dark rounded-2xl p-6">
                    <div className="text-text-secondary text-sm mb-2">Tổng tags</div>
                    <div className="text-3xl font-bold text-white">{tags.length}</div>
                </div>
                <div className="bg-surface-dark border border-border-dark rounded-2xl p-6">
                    <div className="text-text-secondary text-sm mb-2">Đang sử dụng</div>
                    <div className="text-3xl font-bold text-green-400">
                        {tags.filter(t => t.count > 0).length}
                    </div>
                </div>
                <div className="bg-surface-dark border border-border-dark rounded-2xl p-6">
                    <div className="text-text-secondary text-sm mb-2">Tổng documents</div>
                    <div className="text-3xl font-bold text-blue-400">
                        {tags.reduce((sum, t) => sum + t.count, 0)}
                    </div>
                </div>
                <div className="bg-surface-dark border border-border-dark rounded-2xl p-6">
                    <div className="text-text-secondary text-sm mb-2">TB / tag</div>
                    <div className="text-3xl font-bold text-purple-400">
                        {tags.length > 0
                            ? Math.round(tags.reduce((sum, t) => sum + t.count, 0) / tags.length)
                            : 0
                        }
                    </div>
                </div>
            </div>

            {/* Tags Grid */}
            {tags.length === 0 ? (
                <div className="text-center py-16 bg-surface-dark border border-border-dark rounded-2xl">
                    <div className="text-6xl mb-4">🏷️</div>
                    <p className="text-text-secondary mb-4">Chưa có tag nào</p>
                    <button
                        onClick={() => setShowDialog(true)}
                        className="px-4 py-2 bg-primary hover:bg-primary-hover text-white font-medium rounded-lg"
                    >
                        Tạo tag đầu tiên
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-4 gap-4">
                    {tags.map((tag) => (
                        <div
                            key={tag.id}
                            className="bg-surface-dark border border-border-dark rounded-2xl p-6 hover:border-white/20 transition-all"
                        >
                            <div className="flex items-start justify-between mb-3">
                                <div
                                    className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                                    style={{ backgroundColor: `${tag.color}20`, color: tag.color }}
                                >
                                    #
                                </div>
                                <div className="flex items-center gap-1">
                                    <button
                                        onClick={() => handleEdit(tag)}
                                        className="p-1.5 hover:bg-white/10 rounded transition-colors"
                                        title="Chỉnh sửa"
                                    >
                                        <span className="material-symbols-outlined text-sm text-white">edit</span>
                                    </button>
                                    <button
                                        onClick={() => handleDelete(tag.id)}
                                        className="p-1.5 hover:bg-red-500/20 rounded transition-colors"
                                        title="Xóa"
                                    >
                                        <span className="material-symbols-outlined text-sm text-red-400">delete</span>
                                    </button>
                                </div>
                            </div>

                            <h3 className="text-white font-bold mb-1">{tag.name}</h3>
                            {tag.description && (
                                <p className="text-sm text-text-secondary mb-3 line-clamp-2">
                                    {tag.description}
                                </p>
                            )}

                            <div className="flex items-center justify-between">
                                <div
                                    className="px-3 py-1 rounded-full text-xs font-bold"
                                    style={{ backgroundColor: `${tag.color}20`, color: tag.color }}
                                >
                                    {tag.count} docs
                                </div>
                                <div
                                    className="w-4 h-4 rounded-full border-2 border-white/20"
                                    style={{ backgroundColor: tag.color }}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Create/Edit Dialog */}
            {showDialog && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-6">
                    <div className="bg-surface-dark border border-border-dark rounded-2xl p-6 max-w-md w-full">
                        <h2 className="text-xl font-bold text-white mb-6">
                            {editingTag ? 'Chỉnh sửa tag' : 'Tạo tag mới'}
                        </h2>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="text-sm font-medium text-white mb-2 block">
                                    Tên tag *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="VD: Urgent, Technical, Archived..."
                                    className="w-full px-4 py-2 bg-background-dark border border-border-dark rounded-lg text-white focus:border-primary focus:outline-none"
                                />
                            </div>

                            <div>
                                <label className="text-sm font-medium text-white mb-2 block">
                                    Mô tả
                                </label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Mô tả tag này..."
                                    className="w-full px-4 py-2 bg-background-dark border border-border-dark rounded-lg text-white focus:border-primary focus:outline-none resize-none"
                                    rows={2}
                                />
                            </div>

                            <div>
                                <label className="text-sm font-medium text-white mb-2 block">
                                    Màu sắc *
                                </label>
                                <div className="grid grid-cols-5 gap-2">
                                    {predefinedColors.map((color) => (
                                        <button
                                            key={color}
                                            type="button"
                                            onClick={() => {
                                                setSelectedColor(color);
                                                setFormData({ ...formData, color });
                                            }}
                                            className={`w-full aspect-square rounded-lg transition-all ${selectedColor === color
                                                    ? 'ring-2 ring-white ring-offset-2 ring-offset-surface-dark'
                                                    : 'hover:scale-110'
                                                }`}
                                            style={{ backgroundColor: color }}
                                        />
                                    ))}
                                </div>
                            </div>

                            {/* Preview */}
                            <div className="p-4 bg-background-dark rounded-xl">
                                <div className="text-xs text-text-secondary mb-2">Preview:</div>
                                <div
                                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium"
                                    style={{
                                        backgroundColor: `${selectedColor}20`,
                                        color: selectedColor
                                    }}
                                >
                                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: selectedColor }} />
                                    {formData.name || 'Tag name'}
                                </div>
                            </div>

                            <div className="flex items-center gap-3 pt-4">
                                <button
                                    type="submit"
                                    className="flex-1 py-3 bg-primary hover:bg-primary-hover text-white font-bold rounded-xl transition-all"
                                >
                                    {editingTag ? 'Cập nhật' : 'Tạo tag'}
                                </button>
                                <button
                                    type="button"
                                    onClick={resetForm}
                                    className="px-6 py-3 bg-white/5 hover:bg-white/10 text-white font-medium rounded-xl transition-all"
                                >
                                    Hủy
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TagManager;
