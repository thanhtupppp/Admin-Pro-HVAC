import React, { useState, useEffect } from 'react';
import { fieldDispatchService, ServiceJob, JobStatus, JobPriority } from '../services/fieldDispatchService';
import { DndContext, DragEndEvent, closestCorners, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import JobCard from './JobCard';
import AddJobModal from './AddJobModal';

const FieldDispatch: React.FC = () => {
    const [jobs, setJobs] = useState<ServiceJob[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        })
    );

    // Columns configuration
    const columns: { id: JobStatus; title: string; color: string }[] = [
        { id: 'scheduled', title: 'Scheduled', color: 'blue' },
        { id: 'en_route', title: 'En Route', color: 'yellow' },
        { id: 'in_progress', title: 'In Progress', color: 'purple' },
        { id: 'completed', title: 'Completed', color: 'green' },
    ];

    useEffect(() => {
        // Real-time subscription
        const unsubscribe = fieldDispatchService.subscribeToJobs((updatedJobs) => {
            setJobs(updatedJobs);
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, []);

    // Get jobs for specific column
    const getJobsByStatus = (status: JobStatus) => {
        return jobs.filter(job => job.status === status);
    };

    // Handle drag end
    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;

        if (!over) return;

        const jobId = active.id as string;
        const newStatus = over.id as JobStatus;

        // Find the dragged job
        const draggedJob = jobs.find(j => j.id === jobId);
        if (!draggedJob) return;

        // Only update if status changed
        if (draggedJob.status !== newStatus) {
            try {
                await fieldDispatchService.updateJobStatus(jobId, newStatus);
            } catch (error) {
                console.error('Failed to update job status:', error);
            }
        }
    };

    // Priority color helper
    const getPriorityColor = (priority: JobPriority) => {
        switch (priority) {
            case 'urgent': return 'text-red-500';
            case 'high': return 'text-orange-500';
            case 'medium': return 'text-yellow-500';
            case 'low': return 'text-green-500';
            default: return 'text-gray-500';
        }
    };

    // Stats calculation
    const stats = {
        total: jobs.length,
        scheduled: getJobsByStatus('scheduled').length,
        inProgress: getJobsByStatus('in_progress').length + getJobsByStatus('en_route').length,
        completed: getJobsByStatus('completed').length,
    };

    return (
        <div className="p-6 space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">Field Dispatch Board</h1>
                    <p className="text-text-secondary text-sm mt-1">
                        Quản lý công việc kỹ thuật viên thời gian thực
                    </p>
                </div>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="px-4 py-2 bg-primary hover:bg-primary-hover text-white font-bold rounded-xl flex items-center gap-2"
                >
                    <span className="material-symbols-outlined text-[18px]">add</span>
                    New Job
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-4">
                {[
                    { label: 'Total Jobs', value: stats.total, icon: 'work', color: 'blue' },
                    { label: 'Scheduled', value: stats.scheduled, icon: 'event', color: 'purple' },
                    { label: 'Active', value: stats.inProgress, icon: 'pending', color: 'yellow' },
                    { label: 'Completed', value: stats.completed, icon: 'check_circle', color: 'green' }
                ].map((stat, i) => (
                    <div key={i} className="bg-surface-dark border border-border-dark/50 rounded-xl p-4">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs text-text-secondary uppercase">{stat.label}</span>
                            <span className={`material-symbols-outlined text-${stat.color}-500`}>{stat.icon}</span>
                        </div>
                        <p className="text-2xl font-bold text-white">{stat.value}</p>
                    </div>
                ))}
            </div>

            {/* Kanban Board */}
            <DndContext
                sensors={sensors}
                collisionDetection={closestCorners}
                onDragEnd={handleDragEnd}
            >
                <div className="grid grid-cols-4 gap-4">
                    {columns.map(column => (
                        <div key={column.id} className="bg-surface-dark border border-border-dark/50 rounded-xl p-4">
                            {/* Column Header */}
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <h3 className="font-bold text-white">{column.title}</h3>
                                    <p className="text-xs text-text-secondary">
                                        {getJobsByStatus(column.id).length} jobs
                                    </p>
                                </div>
                                <div className={`w-3 h-3 rounded-full bg-${column.color}-500`}></div>
                            </div>

                            {/* Droppable Column */}
                            <SortableContext
                                id={column.id}
                                items={getJobsByStatus(column.id).map(j => j.id!)}
                                strategy={verticalListSortingStrategy}
                            >
                                <div className="space-y-3 min-h-[400px]">
                                    {isLoading ? (
                                        // Loading skeleton
                                        Array(3).fill(0).map((_, i) => (
                                            <div key={i} className="bg-background-dark rounded-xl p-3 animate-pulse space-y-2">
                                                <div className="h-4 bg-white/5 rounded"></div>
                                                <div className="h-3 bg-white/5 rounded w-3/4"></div>
                                            </div>
                                        ))
                                    ) : getJobsByStatus(column.id).length === 0 ? (
                                        <div className="text-center text-text-secondary text-sm py-8">
                                            <span className="material-symbols-outlined text-4xl opacity-20">
                                                inbox
                                            </span>
                                            <p className="mt-2">No jobs</p>
                                        </div>
                                    ) : (
                                        getJobsByStatus(column.id).map(job => (
                                            <JobCard
                                                key={job.id}
                                                job={job}
                                                onUpdate={() => {/* Trigger refresh */ }}
                                            />
                                        ))
                                    )}
                                </div>
                            </SortableContext>
                        </div>
                    ))}
                </div>
            </DndContext>

            {/* Add Job Modal */}
            {showAddModal && (
                <AddJobModal
                    onClose={() => setShowAddModal(false)}
                    onSuccess={() => {
                        setShowAddModal(false);
                    }}
                />
            )}
        </div>
    );
};

export default FieldDispatch;
