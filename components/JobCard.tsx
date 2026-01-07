import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ServiceJob, JobPriority } from '../services/fieldDispatchService';

interface JobCardProps {
    job: ServiceJob;
    onUpdate: () => void;
}

const JobCard: React.FC<JobCardProps> = ({ job, onUpdate }) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: job.id! });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    // Priority badge
    const getPriorityBadge = (priority: JobPriority) => {
        const config = {
            urgent: { bg: 'bg-red-500/10', text: 'text-red-500', label: 'URGENT' },
            high: { bg: 'bg-orange-500/10', text: 'text-orange-500', label: 'High' },
            medium: { bg: 'bg-yellow-500/10', text: 'text-yellow-500', label: 'Medium' },
            low: { bg: 'bg-green-500/10', text: 'text-green-500', label: 'Low' },
        };
        return config[priority] || config.low;
    };

    const priorityBadge = getPriorityBadge(job.priority);

    // Format time
    const scheduledTime = job.scheduledTime.toDate();
    const timeString = scheduledTime.toLocaleTimeString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit'
    });

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className="bg-background-dark border border-border-dark rounded-xl p-3 cursor-grab active:cursor-grabbing hover:border-primary/30 transition-all"
        >
            {/* Header */}
            <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                    <h4 className="font-bold text-white text-sm line-clamp-1">
                        {job.customerName}
                    </h4>
                    <p className="text-xs text-text-secondary line-clamp-1">
                        {job.address}
                    </p>
                </div>
                <span className={`px-2 py-0.5 ${priorityBadge.bg} ${priorityBadge.text} text-[10px] font-bold rounded-full ml-2 flex-shrink-0`}>
                    {priorityBadge.label}
                </span>
            </div>

            {/* Technician */}
            <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-[10px] font-bold text-primary">
                        {job.technicianName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                    </span>
                </div>
                <span className="text-xs text-text-secondary">{job.technicianName}</span>
            </div>

            {/* Time & Duration */}
            <div className="flex items-center justify-between text-xs text-text-secondary">
                <div className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">schedule</span>
                    {timeString}
                </div>
                <div className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">timer</span>
                    {job.estimatedDuration} min
                </div>
            </div>

            {/* Error Code (if any) */}
            {job.errorCode && (
                <div className="mt-2 pt-2 border-t border-white/5">
                    <span className="text-[10px] text-text-secondary uppercase">Error Code:</span>
                    <span className="ml-2 px-2 py-0.5 bg-blue-500/10 text-blue-400 text-[10px] font-bold rounded">
                        {job.errorCode}
                    </span>
                </div>
            )}
        </div>
    );
};

export default JobCard;
