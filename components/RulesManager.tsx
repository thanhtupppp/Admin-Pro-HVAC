import React, { useState, useEffect } from 'react';
import { rulesService } from '../services/rulesService';
import { ClaimRule, RuleCondition, RuleAction, ConditionOperator } from '../types/claim';

const RulesManager: React.FC = () => {
    const [rules, setRules] = useState<ClaimRule[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showAddDialog, setShowAddDialog] = useState(false);
    const [editingRule, setEditingRule] = useState<ClaimRule | null>(null);

    useEffect(() => {
        loadRules();
    }, []);

    const loadRules = async () => {
        setIsLoading(true);
        try {
            const data = await rulesService.getRules();
            setRules(data);
        } catch (error) {
            console.error('Không thể tải rules', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleToggleStatus = async (ruleId: string, currentStatus: 'active' | 'inactive') => {
        try {
            const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
            await rulesService.updateRule(ruleId, { status: newStatus });
            loadRules();
        } catch (error) {
            alert('Không thể cập nhật trạng thái');
        }
    };

    const handleDeleteRule = async (ruleId: string) => {
        if (!confirm('Bạn có chắc muốn xóa rule này?')) return;

        try {
            await rulesService.deleteRule(ruleId);
            loadRules();
        } catch (error) {
            alert('Không thể xóa rule');
        }
    };

    const getOperatorLabel = (operator: ConditionOperator) => {
        const labels: Record<ConditionOperator, string> = {
            equals: '=',
            not_equals: '≠',
            greater_than: '>',
            less_than: '<',
            greater_or_equal: '≥',
            less_or_equal: '≤',
            contains: 'chứa',
            in_range: 'trong khoảng'
        };
        return labels[operator];
    };

    const getFieldLabel = (field: string) => {
        const labels: Record<string, string> = {
            amount: 'Số tiền',
            type: 'Loại',
            category: 'Danh mục',
            customerTier: 'Hạng khách hàng',
            claimCount: 'Số claim trước đó',
            submissionTime: 'Thời gian gửi'
        };
        return labels[field] || field;
    };

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white mb-2">Quản lý Rules</h1>
                    <p className="text-text-secondary">
                        Cấu hình quy tắc tự động phê duyệt claims
                    </p>
                </div>
                <button
                    onClick={() => setShowAddDialog(true)}
                    className="px-6 py-3 bg-primary hover:bg-primary-hover text-white font-bold rounded-xl transition-all flex items-center gap-2"
                >
                    <span className="material-symbols-outlined">add</span>
                    Tạo rule mới
                </button>
            </div>

            {/* Rules List */}
            {isLoading ? (
                <div className="text-center py-16">
                    <span className="material-symbols-outlined animate-spin text-4xl text-primary">
                        progress_activity
                    </span>
                    <p className="text-text-secondary mt-4">Đang tải...</p>
                </div>
            ) : rules.length === 0 ? (
                <div className="text-center py-16 bg-surface-dark border border-border-dark rounded-2xl">
                    <div className="text-6xl mb-4">⚙️</div>
                    <p className="text-text-secondary mb-4">Chưa có rule nào</p>
                    <button
                        onClick={() => setShowAddDialog(true)}
                        className="px-4 py-2 bg-primary hover:bg-primary-hover text-white font-medium rounded-lg"
                    >
                        Tạo rule đầu tiên
                    </button>
                </div>
            ) : (
                <div className="space-y-4">
                    {rules.map((rule, index) => (
                        <div
                            key={rule.id}
                            className="bg-surface-dark border border-border-dark rounded-2xl p-6 hover:border-white/20 transition-all"
                        >
                            {/* Rule Header */}
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-bold rounded-full">
                                            Độ ưu tiên {rule.priority}
                                        </span>
                                        <span className={`px-3 py-1 text-xs font-bold rounded-full ${rule.status === 'active'
                                                ? 'bg-green-500/10 text-green-400'
                                                : 'bg-gray-500/10 text-gray-400'
                                            }`}>
                                            {rule.status === 'active' ? 'Đang hoạt động' : 'Tạm dừng'}
                                        </span>
                                    </div>
                                    <h3 className="text-lg font-bold text-white mb-1">{rule.name}</h3>
                                    <p className="text-sm text-text-secondary">{rule.description}</p>
                                </div>

                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => handleToggleStatus(rule.id, rule.status)}
                                        className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                                        title={rule.status === 'active' ? 'Tạm dừng' : 'Kích hoạt'}
                                    >
                                        <span className={`material-symbols-outlined text-sm ${rule.status === 'active' ? 'text-green-400' : 'text-gray-400'
                                            }`}>
                                            {rule.status === 'active' ? 'toggle_on' : 'toggle_off'}
                                        </span>
                                    </button>
                                    <button
                                        onClick={() => setEditingRule(rule)}
                                        className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                                        title="Chỉnh sửa"
                                    >
                                        <span className="material-symbols-outlined text-sm text-blue-400">
                                            edit
                                        </span>
                                    </button>
                                    <button
                                        onClick={() => handleDeleteRule(rule.id)}
                                        className="p-2 hover:bg-red-500/20 rounded-lg transition-colors"
                                        title="Xóa"
                                    >
                                        <span className="material-symbols-outlined text-sm text-red-400">
                                            delete
                                        </span>
                                    </button>
                                </div>
                            </div>

                            {/* Conditions */}
                            <div className="mb-4">
                                <div className="text-xs font-bold text-text-secondary uppercase mb-2">
                                    Điều kiện
                                </div>
                                <div className="space-y-2">
                                    {rule.conditions.map((cond, idx) => (
                                        <div key={idx} className="flex items-center gap-2 text-sm">
                                            {idx > 0 && (
                                                <span className="px-2 py-1 bg-purple-500/10 text-purple-400 rounded font-mono text-xs">
                                                    {cond.logicOperator || 'AND'}
                                                </span>
                                            )}
                                            <span className="text-white font-medium">{getFieldLabel(cond.field)}</span>
                                            <span className="text-primary font-mono">{getOperatorLabel(cond.operator)}</span>
                                            <span className="text-green-400 font-bold">
                                                {typeof cond.value === 'number'
                                                    ? cond.value.toLocaleString('vi-VN')
                                                    : cond.value
                                                }
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Actions */}
                            <div>
                                <div className="text-xs font-bold text-text-secondary uppercase mb-2">
                                    Hành động
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {rule.actions.map((action, idx) => (
                                        <span
                                            key={idx}
                                            className="px-3 py-1 bg-green-500/10 text-green-400 rounded-lg text-sm font-medium"
                                        >
                                            {action.type === 'auto_approve' && '✓ Tự động phê duyệt'}
                                            {action.type === 'auto_reject' && '✗ Tự động từ chối'}
                                            {action.type === 'require_approval' && '👤 Yêu cầu phê duyệt'}
                                            {action.type === 'assign_to' && `📌 Gán cho ${action.parameters.userId}`}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
                <div className="bg-surface-dark border border-border-dark rounded-xl p-4">
                    <div className="text-text-secondary text-sm mb-1">Tổng rules</div>
                    <div className="text-2xl font-bold text-white">{rules.length}</div>
                </div>
                <div className="bg-surface-dark border border-border-dark rounded-xl p-4">
                    <div className="text-text-secondary text-sm mb-1">Đang hoạt động</div>
                    <div className="text-2xl font-bold text-green-400">
                        {rules.filter(r => r.status === 'active').length}
                    </div>
                </div>
                <div className="bg-surface-dark border border-border-dark rounded-xl p-4">
                    <div className="text-text-secondary text-sm mb-1">Tạm dừng</div>
                    <div className="text-2xl font-bold text-gray-400">
                        {rules.filter(r => r.status === 'inactive').length}
                    </div>
                </div>
            </div>

            {/* Tips */}
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
                <h4 className="text-sm font-bold text-blue-400 mb-2 flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm">tips_and_updates</span>
                    Mẹo sử dụng Rules
                </h4>
                <ul className="space-y-1 text-xs text-text-secondary">
                    <li>• Rules được xử lý theo thứ tự ưu tiên (số nhỏ hơn = ưu tiên cao hơn)</li>
                    <li>• Rule đầu tiên khớp điều kiện sẽ được thực thi</li>
                    <li>• Kết hợp điều kiện bằng AND/OR để tạo logic phức tạp</li>
                    <li>• Tạm dừng rules không cần thiết để tối ưu hiệu suất</li>
                </ul>
            </div>
        </div>
    );
};

export default RulesManager;
