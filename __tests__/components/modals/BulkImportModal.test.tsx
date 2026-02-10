
import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import BulkImportModal from '../../../components/BulkImportModal';
import { importService } from '../../../services/importService';

jest.mock('../../../services/importService');

describe('BulkImportModal', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should render correctly when open', () => {
        render(<BulkImportModal isOpen={true} onClose={jest.fn()} onSuccess={jest.fn()} type="users" />);
        expect(screen.getByText('Import Users via CSV')).toBeInTheDocument();
        expect(screen.getByText('Click to upload or drag & drop')).toBeInTheDocument();
        // Check "Download Template" button with regex to handle icon/text mix
         expect(screen.getByText(/Download Template/i)).toBeInTheDocument();
    });

    it('should not render when closed', () => {
        render(<BulkImportModal isOpen={false} onClose={jest.fn()} onSuccess={jest.fn()} type="users" />);
        expect(screen.queryByText('Import Users via CSV')).not.toBeInTheDocument();
    });

    it('should handle file selection', async () => {
        const file = new File(['dummy content'], 'test.csv', { type: 'text/csv' });
        render(<BulkImportModal isOpen={true} onClose={jest.fn()} onSuccess={jest.fn()} type="users" />);

        const input = document.querySelector('input[type="file"]') as HTMLInputElement;
        fireEvent.change(input, { target: { files: [file] } });

        await waitFor(() => {
            expect(screen.getByText('test.csv')).toBeInTheDocument();
            expect(screen.getByText('Import Now')).toBeInTheDocument();
        });
    });

    it('should call import service on submit', async () => {
        (importService.importUsers as jest.Mock).mockResolvedValue({ success: 10, failed: 0, errors: [] });
        
        render(<BulkImportModal isOpen={true} onClose={jest.fn()} onSuccess={jest.fn()} type="users" />);
        
        const file = new File(['dummy content'], 'test.csv', { type: 'text/csv' });
        const input = document.querySelector('input[type="file"]') as HTMLInputElement;
        fireEvent.change(input, { target: { files: [file] } });

        await waitFor(() => {
             const importBtn = screen.getByText('Import Now');
             expect(importBtn).not.toBeDisabled();
             fireEvent.click(importBtn);
        });

        await waitFor(() => {
             expect(importService.importUsers).toHaveBeenCalledWith(file);
        });
    });

    it('should download template', () => {
        render(<BulkImportModal isOpen={true} onClose={jest.fn()} onSuccess={jest.fn()} type="users" />);
        
        const downloadLink = screen.getByText(/Download Template/i);
        fireEvent.click(downloadLink);
     
        expect(importService.downloadUserTemplate).toHaveBeenCalled();
    });
});
