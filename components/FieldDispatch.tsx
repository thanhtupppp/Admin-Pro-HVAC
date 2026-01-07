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

    // Job detail sidebar
    const [selectedJob, setSelectedJob] = useState<ServiceJob | null>(null);
    const [showJobDetail, setShowJobDetail] = useState(false);

    // Technicians (mock data - in production, fetch from users collection)
    const [technicians] = useState([
        { id: 'tech1', name: 'Nguyễn Văn A' },
        { id: 'tech2', name: 'Trần Văn B' },
        { id: 'tech3', name: 'Lê Văn C' },
    ]);

    // Filters
    const [filterTechnician, setFilterTechnician] = useState('ALL');
    const [filterPriority, setFilterPriority] = useState('ALL');

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

    // Filter jobs
    const filteredJobs = jobs.filter(job => {
        if (filterTechnician !== 'ALL' && job.technicianId !== filterTechnician) return false;
        if (filterPriority !== 'ALL' && job.priority !== filterPriority) return false;
        return true;
    });

    // Get jobs for specific column
    const getJobsByStatus = (status: JobStatus) => {
        return filteredJobs.filter(job => job.status === status);
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

    const handleJobClick = (job: ServiceJob) => {
        setSelectedJob(job);
        setShowJobDetail(true);
    };

    const handleReassign = async (jobId: string, techId: string) => {
        const tech = technicians.find(t => t.id === techId);
        if (!tech) return;

        try {
            await fieldDispatchService.reassignJob(jobId, techId, tech.name);
            alert(`✅ Đã phân công cho ${tech.name}`);
        } catch (error) {
            alert('❌ Phân công thất bại!');
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

            {/* Filters */}
            <div className="flex gap-4">
                <select
                    value={filterTechnician}
                    onChange={(e) => setFilterTechnician(e.target.value)}
                    className="bg-surface-dark border border-border-dark rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                    <option value="ALL">All Technicians</option>
                    {technicians.map(tech => (
                        <option key={tech.id} value={tech.id}>{tech.name}</option>
                    ))}
                </select>

                <select
                    value={filterPriority}
                    onChange={(e) => setFilterPriority(e.target.value)}
                    className="bg-surface-dark border border-border-dark rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                    <option value="ALL">All Priorities</option>
                    <option value="urgent">Urgent</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                </select>
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
                                                onClick={() => handleJobClick(job)}
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

            {/* Job Detail Sidebar */}
            {showJobDetail && selectedJob && (
                <div className="fixed inset-0 bg-black/50 z-50 flex justify-end" onClick={() => setShowJobDetail(false)}>
                    <div
                        className="w-full max-w-md bg-surface-dark border-l border-border-dark p-6 overflow-y-auto animate-in slide-in-from-right"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-white">Job Details</h2>
                            <button
                                onClick={() => setShowJobDetail(false)}
                                className="text-text-secondary hover:text-white transition-colors"
                            >
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        {/* Customer Info */}
                        <div className="space-y-4 mb-6">
                            <div>
                                <label className="text-xs font-bold text-text-secondary uppercase block mb-1">Customer</label>
                                <p className="text-white font-medium">{selectedJob.customerName}</p>
                            </div>

                            <div>
                                <label className="text-xs font-bold text-text-secondary uppercase block mb-1">Phone</label>
                                <p className="text-white">{selectedJob.customerPhone}</p>
                            </div>

                            <div>
                                <label className="text-xs font-bold text-text-secondary uppercase block mb-1">Address</label>
                                <p className="text-white">{selectedJob.address}</p>
                            </div>
                        </div>

                        {/* Job Info */}
                        <div className="space-y-4 mb-6 pb-6 border-b border-white/5">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-bold text-text-secondary uppercase block mb-1">Status</label>
                                    <span className="px-2 py-1 bg-primary/10 text-primary text-xs font-medium rounded capitalize">
                                        {selectedJob.status.replace('_', ' ')}
                                    </span>
                                </div>

                                <div>
                                    <label className="text-xs font-bold text-text-secondary uppercase block mb-1">Priority</label>
                                    <span className={`px-2 py-1 text-xs font-medium rounded capitalize ${selectedJob.priority === 'urgent' ? 'bg-red-500/10 text-red-500' :
                                            selectedJob.priority === 'high' ? 'bg-orange-500/10 text-orange-500' :
                                                selectedJob.priority === 'medium' ? 'bg-yellow-500/10 text-yellow-500' :
                                                    'bg-green-500/10 text-green-500'
                                        }`}>
                                        {selectedJob.priority}
                                    </span>
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-bold text-text-secondary uppercase block mb-1">Scheduled Time</label>
                                <p className="text-white">
                                    {selectedJob.scheduledTime.toDate().toLocaleString('vi-VN')}
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-bold text-text-secondary uppercase block mb-1">Est. Duration</label>
                                    <p className="text-white">{selectedJob.estimatedDuration} min</p>
                                </div>

                                {selectedJob.actualDuration && (
                                    <div>
                                        <label className="text-xs font-bold text-text-secondary uppercase block mb-1">Actual Duration</label>
                                        <p className="text-white">{selectedJob.actualDuration} min</p>
                                    </div>
                                )}
                            </div>

                            {selectedJob.errorCode && (
                                <div>
                                    <label className="text-xs font-bold text-text-secondary uppercase block mb-1">Error Code</label>
                                    <span className="px-2 py-1 bg-blue-500/10 text-blue-400 text-sm font-mono rounded">
                                        {selectedJob.errorCode}
                                    </span>
                                </div>
                            )}

                            {selectedJob.notes && (
                                <div>
                                    <label className="text-xs font-bold text-text-secondary uppercase block mb-1">Notes</label>
                                    <p className="text-white text-sm">{selectedJob.notes}</p>
                                </div>
                            )}
                        </div>

                        {/* Technician Assignment */}
                        <div className="mb-6">
                            <label className="text-xs font-bold text-text-secondary uppercase block mb-2">Assigned Technician</label>
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                                    <span className="text-sm font-bold text-primary">
                                        {selectedJob.technicianName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                                    </span>
                                </div>
                                <span className="text-white font-medium">{selectedJob.technicianName}</span>
                            </div>

                            <select
                                value={selectedJob.technicianId}
                                onChange={(e) => handleReassign(selectedJob.id!, e.target.value)}
                                className="w-full bg-background-dark border border-border-dark rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                            >
                                {technicians.map(tech => (
                                    <option key={tech.id} value={tech.id}>{tech.name}</option>
                                ))}
                            </select>
                        </div>

                        {/* Timestamps */}
                        <div className="space-y-2 text-xs text-text-secondary">
                            <div className="flex justify-between">
                                <span>Created:</span>
                                <span>{selectedJob.createdAt.toDate().toLocaleString('vi-VN')}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Updated:</span>
                                <span>{selectedJob.updatedAt.toDate().toLocaleString('vi-VN')}</span>
                            </div>
                            {selectedJob.completedAt && (
                                <div className="flex justify-between text-green-500">
                                    <span>Completed:</span>
                                    <span>{selectedJob.completedAt.toDate().toLocaleString('vi-VN')}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FieldDispatch;
