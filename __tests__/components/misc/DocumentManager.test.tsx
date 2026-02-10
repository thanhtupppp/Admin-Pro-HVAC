
import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import DocumentManager from '../../../components/DocumentManager';
import { documentService } from '../../../services/documentService';

jest.mock('../../../services/documentService');
jest.mock('../../../services/errorService', () => ({
    errorService: { getErrors: jest.fn().mockResolvedValue([]) }
}));
jest.mock('../../../services/brandService', () => ({
    brandService: { getBrands: jest.fn().mockResolvedValue([]) }
}));

describe('DocumentManager', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        (documentService.getDocuments as jest.Mock).mockResolvedValue([
            { id: 'd1', title: 'Manual 1', url: 'http://test.com/doc.pdf', type: 'manual' }
        ]);
    });

    it('should render documents', async () => {
        render(<DocumentManager />);
        await waitFor(() => {
            expect(screen.getByText('Manual 1')).toBeInTheDocument();
        });
    });
});
