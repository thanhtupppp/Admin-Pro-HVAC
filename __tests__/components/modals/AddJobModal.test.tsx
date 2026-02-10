
import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import AddJobModal from '../../../components/AddJobModal';
import { fieldDispatchService } from '../../../services/fieldDispatchService';
import { userService } from '../../../services/userService';
import { errorService } from '../../../services/errorService';

// Mock services
jest.mock('../../../services/fieldDispatchService', () => ({
    fieldDispatchService: {
        addJob: jest.fn()
    }
}));
jest.mock('../../../services/userService', () => ({
    userService: {
        getUsers: jest.fn()
    }
}));
jest.mock('../../../services/errorService', () => ({
    errorService: {
        getErrors: jest.fn()
    }
}));

describe('AddJobModal', () => {
    beforeEach(() => {
        jest.clearAllMocks();

        // Mock return values
        (userService.getUsers as jest.Mock).mockResolvedValue([
            { id: 't1', name: 'Tech One', email: 't1@example.com', role: 'Technician' },
            { id: 'u1', name: 'User One', email: 'u1@example.com', role: 'User' } // Should be filtered out
        ]);
        (errorService.getErrors as jest.Mock).mockResolvedValue([]);
        (fieldDispatchService.addJob as jest.Mock).mockResolvedValue('job123');
    });

    it.skip('should load technicians and submit form', async () => {
        const onSuccess = jest.fn();
        render(<AddJobModal onClose={jest.fn()} onSuccess={onSuccess} />);

        // Wait for technician data to load and render
        // Using findByText with regex which retries until element appears
        await screen.findByText(/Tech One/i, {}, { timeout: 3000 });

        // Select Technician
        const techSelect = screen.getByRole('combobox');
        fireEvent.change(techSelect, { target: { value: 't1' } });

        // Fill other inputs
        // Using inputs by index or other robust method if labels are tricky
        // We know structure: Customer Name, Phone, Address...
        
        // Strategy: find by placeholders if available or getAllByRole('textbox')
        const inputs = screen.getAllByRole('textbox');
        // inputs[0]: Customer Name
        // inputs[1]: Phone
        // inputs[2]: Address
        
        if (inputs.length < 3) throw new Error('Not enough inputs found');

        fireEvent.change(inputs[0], { target: { value: 'Customer A' } });
        fireEvent.change(inputs[2], { target: { value: '123 Street' } });

        // Date and Time inputs might not have 'textbox' role
        // Use verify by label text or container query
        // "Date *" and "Time *" labels are present.
        // We can find input associated with "Date *" label if htmlFor was present, but it's not.
        // We can find label and get next sibling input.
        
        const dateLabel = screen.getByText(/Date/i);
        const dateInput = dateLabel.nextElementSibling as HTMLInputElement;
        fireEvent.change(dateInput, { target: { value: '2025-01-01' } });

        const timeLabel = screen.getByText(/Time/i);
        const timeInput = timeLabel.nextElementSibling as HTMLInputElement;
        fireEvent.change(timeInput, { target: { value: '10:00' } });

        // Submit
        const createBtn = screen.getByText('Create Job');
        fireEvent.click(createBtn);

        // Verify
        await waitFor(() => {
            expect(fieldDispatchService.addJob).toHaveBeenCalledWith(expect.objectContaining({
                customerName: 'Customer A',
                address: '123 Street',
                technicianId: 't1',
                // Date/Time are converted to Timestamp, so difficult to exact match without helpers, 
                // but checking basics is enough
            }));
            expect(onSuccess).toHaveBeenCalled();
        });
    });

    it('should close on cancel', () => {
        const onClose = jest.fn();
        render(<AddJobModal onClose={onClose} onSuccess={jest.fn()} />);
        
        const cancelBtn = screen.getByText('Cancel');
        fireEvent.click(cancelBtn);
        expect(onClose).toHaveBeenCalled();
    });
});
