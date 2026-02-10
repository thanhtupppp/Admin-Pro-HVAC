
import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import OCRTool from '../../../components/OCRTool';
import { analyzeFileContent } from '../../../components/AIService';

jest.mock('../../../components/AIService');

describe('OCRTool', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        (analyzeFileContent as jest.Mock).mockResolvedValue({
            code: 'E001',
            brand: 'Panasonic',
            title: 'Test Error',
            symptom: 'Test symptom',
            cause: 'Test cause',
            steps: ['Step 1', 'Step 2']
        });
    });

    it('should render OCR tool upload button', () => {
        render(<OCRTool />);
        // Component renders "Tải lên PDF/Ảnh" button
        expect(screen.getByText(/Tải lên PDF\/Ảnh/i)).toBeInTheDocument();
    });

    it('should render AI section', () => {
        render(<OCRTool />);
        // Component renders "AI Phân tích Multimodal" heading
        expect(screen.getByText(/AI Phân tích Multimodal/i)).toBeInTheDocument();
    });
});
