import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface SortableStepItemProps {
    id: string;
    index: number;
    step: string;
    onUpdate: (value: string) => void;
    onRemove: () => void;
    canRemove: boolean;
}

const SortableStepItem: React.FC<SortableStepItemProps> = ({
    id,
    index,
    step,
    onUpdate,
    onRemove,
    canRemove
}) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <div ref={setNodeRef} style={style} className="flex gap-4">
            {/* Drag Handle */}
            <div
                {...attributes}
                {...listeners}
                className="w-8 h-8 rounded-lg bg-background-dark flex items-center justify-center font-bold text-text-secondary border border-border-dark shrink-0 cursor-grab active:cursor-grabbing hover:border-primary/50 transition-colors"
            >
                <span className="material-symbols-outlined text-sm">drag_indicator</span>
            </div>

            {/* Step Number */}
            <span className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center font-bold text-primary border border-primary/20 shrink-0">
                {index + 1}
            </span>

            {/* Input */}
            <input
                type="text"
                value={step}
                onChange={(e) => onUpdate(e.target.value)}
                className="flex-1 bg-background-dark border border-border-dark rounded-xl px-4 py-2 text-white focus:ring-1 focus:ring-primary outline-none"
                placeholder={`Bước ${index + 1}...`}
            />

            {/* Delete Button */}
            {canRemove && (
                <button
                    onClick={onRemove}
                    className="text-text-secondary hover:text-red-400 transition-colors"
                >
                    <span className="material-symbols-outlined">delete</span>
                </button>
            )}
        </div>
    );
};

export default SortableStepItem;
