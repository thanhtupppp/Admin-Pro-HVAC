import React from 'react';
import TrendIndicator from './TrendIndicator';

interface StatCardProps {
    title: string;
    value: number | string;
    trend?: number;
    icon: string;
    iconColor?: string;
    isVisible?: boolean;
    subtitle?: string;
}

/**
 * StatCard - Reusable dashboard card with optional trend indicator
 * Supports dynamic visibility for Bento Grid
 */
const StatCard: React.FC<StatCardProps> = ({
    title,
    value,
    trend,
    icon,
    iconColor = 'text-primary',
    isVisible = true,
    subtitle
}) => {
    if (!isVisible) return null;

    return (
        <div className="bg-surface-dark border border-border-dark/50 rounded-2xl p-6 hover:border-primary/20 transition-all animate-in fade-in duration-300">
            <div className="flex items-center justify-between mb-4">
                <span className="text-text-secondary text-sm font-medium">{title}</span>
                <span className={`material-symbols-outlined ${iconColor}`}>{icon}</span>
            </div>

            <div className="flex items-baseline gap-2 mb-2">
                <span className="text-3xl font-bold text-white">
                    {typeof value === 'number' ? value.toLocaleString('vi-VN') : value}
                </span>
            </div>

            {subtitle && (
                <p className="text-xs text-text-secondary mb-2">{subtitle}</p>
            )}

            {trend !== undefined && trend !== null && (
                <TrendIndicator value={trend} />
            )}
        </div>
    );
};

export default StatCard;
