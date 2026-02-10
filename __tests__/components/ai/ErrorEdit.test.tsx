
import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import ErrorEdit from '../../../components/ErrorEdit';
import { errorService } from '../../../services/errorService';
import { brandService } from '../../../services/brandService';

jest.mock('../../../services/errorService');
jest.mock('../../../services/brandService');
jest.mock('@dnd-kit/core', () => ({
    ...jest.requireActual('@dnd-kit/core'),
    DndContext: ({ children }: any) => <div>{children}</div>
}));
jest.mock('@dnd-kit/sortable', () => ({
    ...jest.requireActual('@dnd-kit/sortable'),
    SortableContext: ({ children }: any) => <div>{children}</div>
}));
jest.mock('../../../components/SortableStepItem', () => ({ step, index }: any) => <div>Step {index + 1}: {step}</div>);

describe('ErrorEdit', () => {
    const mockError = {
        id: 'e1',
        code: 'E101',
        title: 'Sensor Error',
        brand: 'Daikin',
        model: 'FTKC',
        diagnosis: 'Check sensor',
        steps: ['Open unit', 'Check wire'],
        components: ['Sensor'],
        tools: ['Screwdriver'],
        videos: [],
        images: [],
        status: 'active'
    };

    beforeEach(() => {
        jest.clearAllMocks();
        (errorService.getErrorById as jest.Mock).mockResolvedValue(mockError);
        (brandService.getBrands as jest.Mock).mockResolvedValue([]);
        (errorService.getErrors as jest.Mock).mockResolvedValue([]);
        (errorService.updateError as jest.Mock).mockResolvedValue(true);
    });

    it('should load and display error details', async () => {
        const onCancel = jest.fn();
        render(<ErrorEdit errorId="e1" onCancel={onCancel} />);
        
        expect(await screen.findByDisplayValue('E101')).toBeInTheDocument();
        expect(screen.getByDisplayValue('Sensor Error')).toBeInTheDocument();
        expect(screen.getByText('Step 1: Open unit')).toBeInTheDocument();
    });

    it('should save changes', async () => {
        const onCancel = jest.fn();
        const onSave = jest.fn();
        render(<ErrorEdit errorId="e1" onCancel={onCancel} onSave={onSave} />);
        
        await screen.findByDisplayValue('E101');
        
        const saveBtn = screen.getByText('Lưu ngay');
        fireEvent.click(saveBtn);

        await waitFor(() => {
            expect(errorService.updateError).toHaveBeenCalled();
            expect(onSave).toHaveBeenCalled();
        });
    });
});
