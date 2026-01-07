import React from 'react';

interface AlertBoxProps {
    type: 'info' | 'warn' | 'error';
    title: string;
    message: string;
    timestamp?: string;
}

const AlertBox: React.FC<AlertBoxProps> = ({ type, title, message, timestamp }) => {
    const config = {
        info: { icon: 'ℹ️', color: 'border-brand-primary/40 bg-brand-primary/5 text-brand-primary' },
        warn: { icon: '⚠', color: 'border-status-warn/40 bg-status-warn/5 text-status-warn' },
        error: { icon: '⛔', color: 'border-status-error/40 bg-status-error/5 text-status-error' }
    };

    const { icon, color } = config[type];

    return (
        <div className={`flex gap-3 rounded-lg border p-3 ${color}`}>
            <span className="text-xl flex-shrink-0">{icon}</span>
            <div className="flex-1">
                <div className="font-medium">{title}</div>
                <div className="text-sm text-text-muted mt-0.5">{message}</div>
                {timestamp && (
                    <div className="text-xs text-text-muted mt-1 font-mono">{timestamp}</div>
                )}
            </div>
        </div>
    );
};

export default AlertBox;
