import React from 'react';

interface TrendIndicatorProps {
    value: number; // Percentage change
    period?: 'week' | 'month' | 'quarter';
}

/**
 * TrendIndicator - Shows trend with percentage and direction
 * @param value - Percentage change (positive/negative)
 * @param period - Time period for comparison
 */
const TrendIndicator: React.FC<TrendIndicatorProps> = ({ value, period = 'month' }) => {
    const isPositive = value > 0;
    const isNeutral = value === 0;

    const color = isPositive ? 'text-green-500' : isNeutral ? 'text-gray-400' : 'text-red-500';
    const bg = isPositive ? 'bg-green-500/10' : isNeutral ? 'bg-gray-400/10' : 'bg-red-500/10';
    const arrow = isPositive ? '▲' : isNeutral ? '─' : '▼';

    const periodText = {
        week: 'tuần trước',
        month: 'tháng trước',
        quarter: 'quý trước'
    };

    return (
        <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg ${bg}`}>
            <span className={`text-xs font-bold ${color}`}>{arrow}</span>
            <span className={`text-xs font-bold ${color}`}>
                {Math.abs(value).toFixed(1)}%
            </span>
            <span className="text-[10px] text-text-secondary">
                vs {periodText[period]}
            </span>
        </div>
    );
};

export default TrendIndicator;
