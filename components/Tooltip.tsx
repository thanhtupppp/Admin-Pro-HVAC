import React from 'react';

interface TooltipProps {
    text: string;
    children: React.ReactNode;
    position?: 'top' | 'bottom' | 'left' | 'right';
}

/**
 * Tooltip component for context-aware help
 * Displays helpful information on hover
 */
const Tooltip: React.FC<TooltipProps> = ({ text, children, position = 'top' }) => {
    const [isVisible, setIsVisible] = React.useState(false);

    const positionClasses = {
        top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
        bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
        left: 'right-full top-1/2 -translate-y-1/2 mr-2',
        right: 'left-full top-1/2 -translate-y-1/2 ml-2',
    };

    return (
        <div
            className="relative inline-flex items-center"
            onMouseEnter={() => setIsVisible(true)}
            onMouseLeave={() => setIsVisible(false)}
        >
            {children}
            {isVisible && (
                <div
                    className={`absolute z-50 px-3 py-2 text-xs text-white bg-gray-900 rounded-lg shadow-lg border border-gray-700 whitespace-nowrap max-w-xs ${positionClasses[position]} animate-in fade-in duration-200`}
                >
                    {text}
                    {/* Arrow */}
                    <div
                        className={`absolute w-2 h-2 bg-gray-900 border-gray-700 rotate-45 ${position === 'top' ? 'bottom-[-4px] left-1/2 -translate-x-1/2 border-b border-r' :
                                position === 'bottom' ? 'top-[-4px] left-1/2 -translate-x-1/2 border-t border-l' :
                                    position === 'left' ? 'right-[-4px] top-1/2 -translate-y-1/2 border-r border-t' :
                                        'left-[-4px] top-1/2 -translate-y-1/2 border-l border-b'
                            }`}
                    />
                </div>
            )}
        </div>
    );
};

export default Tooltip;
