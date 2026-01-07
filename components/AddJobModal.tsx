import React, { useState, useEffect } from 'react';
import { fieldDispatchService, JobPriority } from '../services/fieldDispatchService';
import { userService } from '../services/userService';
import { errorService } from '../services/errorService';
import { Timestamp } from 'firebase/firestore';

interface AddJobModalProps {
    onClose: () => void;
    onSuccess: () => void;
}

const AddJobModal: React.FC<AddJobModalProps> = ({ onClose, onSuccess }) => {
    const [customerName, setCustomerName] = useState('');
    const [customerPhone, setCustomerPhone] = useState('');
    const [address, setAddress] = useState('');
    const [technicianId, setTechnicianId] = useState('');
    const [technicianName, setTechnicianName] = useState('');
    const [scheduledDate, setScheduledDate] = useState('');
    const [scheduledTime, setScheduledTime] = useState('');
    const [estimatedDuration, setEstimatedDuration] = useState('60');
    const [priority, setPriority] = useState<JobPriority>('medium');
    const [errorCode, setErrorCode] = useState('');
    const [notes, setNotes] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    const [technicians, setTechnicians] = useState<any[]>([]);
    const [errorCodes, setErrorCodes] = useState<any[]>([]);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [usersData, errorsData] = await Promise.all([
                userService.getUsers(),
                errorService.getErrors()
            ]);

            // Filter technicians
            const techs = usersData.filter(u => u.role === 'Technician' || u.role === 'Editor');
            setTechnicians(techs);
            setErrorCodes(errorsData);
        } catch (error) {
            console.error('Load data failed:', error);
        }
    };

    const handleTechnicianChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedId = e.target.value;
        const tech = technicians.find(t => t.id === selectedId);
        setTechnicianId(selectedId);
        setTechnicianName(tech?.name || '');
    };

    const handleSave = async () => {
        // Validation
        if (!customerName || !address || !technicianId || !scheduledDate || !scheduledTime) {
            alert('Vui lòng điền đầy đủ thông tin!');
            return;
        }

        setIsSaving(true);
        try {
            // Combine date + time
            const dateTime = new Date(`${scheduledDate}T${scheduledTime}`);

            await fieldDispatchService.addJob({
                customerId: '', // TODO: Link to actual customer
                customerName,
                customerPhone,
                address,
                technicianId,
                technicianName,
                scheduledTime: Timestamp.fromDate(dateTime),
                status: 'scheduled',
                errorCode: errorCode || undefined,
                estimatedDuration: parseInt(estimatedDuration),
                notes,
                priority,
                createdAt: Timestamp.now(),
                updatedAt: Timestamp.now()
            });

            onSuccess();
        } catch (error: any) {
            alert(error.message);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-surface-dark border border-border-dark rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <h2 className="text-xl font-bold text-white mb-6">Create New Job</h2>

                <div className="space-y-4">
                    {/* Customer Info */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-bold text-text-secondary uppercase block mb-2">
                                Customer Name *
                            </label>
                            <input
                                type="text"
                                value={customerName}
                                onChange={(e) => setCustomerName(e.target.value)}
                                className="w-full bg-background-dark border border-border-dark rounded-xl px-4 py-3 text-white"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-text-secondary uppercase block mb-2">
                                Phone
                            </label>
                            <input
                                type="tel"
                                value={customerPhone}
                                onChange={(e) => setCustomerPhone(e.target.value)}
                                className="w-full bg-background-dark border border-border-dark rounded-xl px-4 py-3 text-white"
                            />
                        </div>
                    </div>

                    {/* Address */}
                    <div>
                        <label className="text-xs font-bold text-text-secondary uppercase block mb-2">
                            Address *
                        </label>
                        <input
                            type="text"
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            className="w-full bg-background-dark border border-border-dark rounded-xl px-4 py-3 text-white"
                        />
                    </div>

                    {/* Technician */}
                    <div>
                        <label className="text-xs font-bold text-text-secondary uppercase block mb-2">
                            Assign Technician *
                        </label>
                        <select
                            value={technicianId}
                            onChange={handleTechnicianChange}
                            className="w-full bg-background-dark border border-border-dark rounded-xl px-4 py-3 text-white"
                        >
                            <option value="">Select technician...</option>
                            {technicians.map(tech => (
                                <option key={tech.id} value={tech.id}>
                                    {tech.name} ({tech.email})
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Schedule */}
                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <label className="text-xs font-bold text-text-secondary uppercase block mb-2">
                                Date *
                            </label>
                            <input
                                type="date"
                                value={scheduledDate}
                                onChange={(e) => setScheduledDate(e.target.value)}
                                className="w-full bg-background-dark border border-border-dark rounded-xl px-4 py-3 text-white"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-text-secondary uppercase block mb-2">
                                Time *
                            </label>
                            <input
                                type="time"
                                value={scheduledTime}
                                onChange={(e) => setScheduledTime(e.target.value)}
                                className="w-full bg-background-dark border border-border-dark rounded-xl px-4 py-3 text-white"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-text-secondary uppercase block mb-2">
                                Duration (min)
                            </label>
                            <input
                                type="number"
                                value={estimatedDuration}
                                onChange={(e) => setEstimatedDuration(e.target.value)}
                                className="w-full bg-background-dark border border-border-dark rounded-xl px-4 py-3 text-white"
                            />
                        </div>
                    </div>

                    {/* Priority & Error Code */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-bold text-text-secondary uppercase block mb-2">
                                Priority
                            </label>
                            <select
                                value={priority}
                                onChange={(e) => setPriority(e.target.value as JobPriority)}
                                className="w-full bg-background-dark border border-border-dark rounded-xl px-4 py-3 text-white"
                            >
                                <option value="low">Low</option>
                                <option value="medium">Medium</option>
                                <option value="high">High</option>
                                <option value="urgent">Urgent</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-xs font-bold text-text-secondary uppercase block mb-2">
                                Error Code
                            </label>
                            <select
                                value={errorCode}
                                onChange={(e) => setErrorCode(e.target.value)}
                                className="w-full bg-background-dark border border-border-dark rounded-xl px-4 py-3 text-white"
                            >
                                <option value="">None</option>
                                {errorCodes.map(ec => (
                                    <option key={ec.id} value={ec.code}>
                                        {ec.code} - {ec.title}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Notes */}
                    <div>
                        <label className="text-xs font-bold text-text-secondary uppercase block mb-2">
                            Notes
                        </label>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            rows={3}
                            className="w-full bg-background-dark border border-border-dark rounded-xl px-4 py-3 text-white resize-none"
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-4">
                        <button
                            onClick={handleSave}
                            disabled={isSaving}
                            className="flex-1 py-3 bg-primary hover:bg-primary-hover text-white font-bold rounded-xl disabled:opacity-50"
                        >
                            {isSaving ? 'Creating...' : 'Create Job'}
                        </button>
                        <button
                            onClick={onClose}
                            className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-white font-bold rounded-xl"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AddJobModal;
