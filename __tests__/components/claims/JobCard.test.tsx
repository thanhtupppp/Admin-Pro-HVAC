
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import JobCard from '../../../components/JobCard';
import { ServiceJob } from '../../../services/fieldDispatchService';

// Mock dnd-kit
jest.mock('@dnd-kit/sortable', () => ({
    useSortable: () => ({
        attributes: {},
        listeners: {},
        setNodeRef: jest.fn(),
        transform: null,
        transition: null,
        isDragging: false
    })
}));

// Mock CSS utilities
jest.mock('@dnd-kit/utilities', () => ({
    CSS: {
        Transform: {
            toString: jest.fn()
        }
    }
}));

describe('JobCard', () => {
    const mockJob: ServiceJob = {
        id: 'j1',
        customerName: 'Alice',
        address: '123 Street',
        technicianId: 't1',
        technicianName: 'Bob Tech',
        scheduledTime: {
            toDate: () => new Date('2024-01-01T10:00:00')
        } as any,
        estimatedDuration: 60,
        status: 'scheduled',
        priority: 'high',
        type: 'maintenance'
    };

    const mockUpdate = jest.fn();

    it('should render job details', () => {
        render(<JobCard job={mockJob} onUpdate={mockUpdate} />);
        expect(screen.getByText('Alice')).toBeInTheDocument();
        expect(screen.getByText('123 Street')).toBeInTheDocument();
        expect(screen.getByText('Bob Tech')).toBeInTheDocument();
        expect(screen.getByText('High')).toBeInTheDocument();
    });

    it('should show error code if present', () => {
        const errorJob = { ...mockJob, errorCode: 'E101' };
        render(<JobCard job={errorJob} onUpdate={mockUpdate} />);
        expect(screen.getByText('E101')).toBeInTheDocument();
    });
});
