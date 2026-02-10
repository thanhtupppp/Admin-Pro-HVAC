
import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import SmartErrorImport from '../../../components/SmartErrorImport';
import { analyzeFileContent } from '../../../components/AIService';
import { errorService } from '../../../services/errorService';
import { brandService } from '../../../services/brandService';

// Mock services
jest.mock('../../../components/AIService');
jest.mock('../../../services/errorService');
jest.mock('../../../services/brandService');

// Mock specific implementation for brandService
(brandService.getBrands as jest.Mock).mockResolvedValue([
    { id: '1', name: 'Daikin' },
    { id: '2', name: 'Panasonic' }
]);

(analyzeFileContent as jest.Mock).mockResolvedValue({
    code: 'E1',
    title: 'System Error',
    symptom: 'Not working',
    cause: 'Unknown',
    steps: ['Check power'],
    components: ['Board'],
    tools: ['Multimeter'],
    confidence: 85
});

(errorService.createError as jest.Mock).mockResolvedValue({ id: 'err_123' });

describe('SmartErrorImport', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        // Mock URL.createObjectURL
        global.URL.createObjectURL = jest.fn(() => 'blob:url');
        global.URL.revokeObjectURL = jest.fn();
        // Mock window.alert
        jest.spyOn(window, 'alert').mockImplementation(() => {});
    });

    it('should render and load brands', async () => {
        render(<SmartErrorImport />);
        expect(screen.getByText('Nhập liệu Thông minh (AI Smart Import)')).toBeInTheDocument();
        
        await waitFor(() => {
            expect(screen.getByText('Daikin')).toBeInTheDocument();
        });
    });

    it('should handle file selection and analysis', async () => {
        render(<SmartErrorImport />);
        
        // Wait for brands to load
        await waitFor(() => expect(screen.getByText('Daikin')).toBeInTheDocument());

        // Step 1: Select Brand
        const brandSelect = screen.getByRole('combobox');
        fireEvent.change(brandSelect, { target: { value: 'Daikin' } });
        fireEvent.click(screen.getByText('Tiếp tục'));

        // Step 2: Upload
        // Verify step 2 is active
        await waitFor(() => expect(screen.getByText('Bước 2: Tải lên tài liệu')).toBeInTheDocument());

        const file = new File(['dummy content'], 'manual.pdf', { type: 'application/pdf' });
        const input = screen.getByTestId('file-upload-input');
        
        // Manual override for file input since user-event is not available
        Object.defineProperty(input, 'files', {
            value: [file],
            writable: false
        });
        fireEvent.change(input);
        
        // Verify button enabled instead of filename
        await waitFor(() => {
             const analyzeBtn = screen.getByText('Bắt đầu AI Phân tích');
             expect(analyzeBtn).not.toBeDisabled();
        });

        const analyzeBtn = screen.getByText('Bắt đầu AI Phân tích');
        fireEvent.click(analyzeBtn);

        await waitFor(() => {
            expect(analyzeFileContent).toHaveBeenCalled();
        });
        
        // Step 3
        await waitFor(() => {
             expect(screen.getByDisplayValue('E1')).toBeInTheDocument();
        });
    });
});
