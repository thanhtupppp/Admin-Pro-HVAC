import React from 'react';

interface StatusCardProps {
    label: string;
    value: string | number;
    unit?: string;
    status?: 'ok' | 'warn' | 'error' | 'off';
    icon?: string;
    subtitle?: string;
}

const StatusCard: React.FC<StatusCardProps> = ({
    label,
    value,
    unit,
    status = 'ok',
    icon,
    subtitle
}) => {
    const statusClasses = {
        ok: 'status-ok',
        warn: 'status-warn',
        error: 'status-error',
        off: 'status-off'
    };

    const statusLabels = {
        ok: '● Hoạt động bình thường',
        warn: '⚠ Cảnh báo',
        error: '⛔ Lỗi',
        off: '◯ Tắt'
    };

    return (
        <div className="industrial-card">
            {/* Label */}
            <div className="text-sm text-text-muted mb-1">{label}</div>

            {/* Value */}
            <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl font-semibold text-text-primary font-mono">
                    {value}
                </span>
                {unit && (
                    <span className="text-text-secondary text-sm">{unit}</span>
                )}
            </div>

            {/* Status & Subtitle */}
            <div className="mt-2 flex items-center justify-between text-sm">
                <span className={statusClasses[status]}>
                    {statusLabels[status]}
                </span>
                {subtitle && (
                    <span className="text-text-muted">{subtitle}</span>
                )}
            </div>

            {/* Optional Icon */}
            {icon && (
                <div className="absolute top-4 right-4 opacity-10">
                    <span className="material-symbols-outlined text-4xl">
                        {icon}
                    </span>
                </div>
            )}
        </div>
    );
};

export default StatusCard;
