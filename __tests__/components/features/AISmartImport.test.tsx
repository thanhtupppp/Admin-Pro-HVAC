
import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import AISmartImport from '../../../components/AISmartImport';
import { aiImportService } from '../../../services/aiImportService';

jest.mock('../../../services/aiImportService');

describe('AISmartImport', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.spyOn(console, 'error').mockImplementation((...args) => console.log('Console Error:', args));
        (aiImportService.extractFromImage as jest.Mock).mockResolvedValue({
            fields: { 
                name: { label: 'Name', value: 'Test', confidence: 0.95 }
            }
        });
    });

    it('should render file upload initially', () => {
        render(<AISmartImport />);
        expect(screen.getByText(/Click để chọn file hoặc kéo thả vào đây/i)).toBeInTheDocument();
    });

    it('should handle file upload and analysis', async () => {
        const { container } = render(<AISmartImport />);
        
        const file = new File(['dummy content'], 'test.pdf', { type: 'application/pdf' });
        const input = container.querySelector('input[type="file"]');
        
        if (!input) throw new Error('File input not found');

        fireEvent.change(input, { target: { files: [file] } });

        await waitFor(() => {
            // Check if analysis button appears or auto-starts
            expect(screen.getByText('Phân tích với AI')).toBeInTheDocument();
        });

        const analyzeBtn = screen.getByText('Phân tích với AI');
        fireEvent.click(analyzeBtn);

        await waitFor(() => {
            expect(aiImportService.extractFromImage).toHaveBeenCalled();
        });
    });
});
