
import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import ErrorList from '../../../components/ErrorList';
import { errorService } from '../../../services/errorService';

jest.mock('../../../services/errorService');

describe('ErrorList', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        (errorService.getErrors as jest.Mock).mockResolvedValue([
            { 
                id: 'e1', 
                code: 'E101', 
                title: 'Sensor Failure', 
                brand: 'Daikin',
                model: 'FTKC',
                status: 'active',
                diagnosis: 'Check wiring',
                updatedAt: '2024-01-01'
            }
        ]);
    });

    it('should render error codes', async () => {
        const onEdit = jest.fn();
        render(<ErrorList onEdit={onEdit} />);
        expect(await screen.findByText('E101')).toBeInTheDocument();
        expect(screen.getByText('Sensor Failure')).toBeInTheDocument();
    });

    it('should filter errors', async () => {
        const onEdit = jest.fn();
        render(<ErrorList onEdit={onEdit} />);
        await screen.findByText('E101');

        const searchInput = screen.getByPlaceholderText('Tìm kiếm mã lỗi, tiêu đề, hãng...');
        fireEvent.change(searchInput, { target: { value: 'Daikin' } });

        expect(screen.getByText('E101')).toBeInTheDocument();
        
        fireEvent.change(searchInput, { target: { value: 'Panasonic' } });
        await waitFor(() => {
            expect(screen.queryByText('E101')).not.toBeInTheDocument();
        });
    });
});
