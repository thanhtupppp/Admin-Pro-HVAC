
import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import BrandManager from '../../../components/BrandManager';
import { brandService } from '../../../services/brandService';

jest.mock('../../../services/brandService');

jest.mock('../../../components/BulkImportModal', () => () => <div data-testid="bulk-import-modal" />);

describe('BrandManager', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        (brandService.getBrands as jest.Mock).mockResolvedValue([
            { id: 'b1', name: 'Daikin', logo: '', modelCount: 5 }
        ]);
        (brandService.createBrand as jest.Mock).mockResolvedValue({ id: 'b2', name: 'Panasonic' });
    });

    it('should render brand list', async () => {
        render(<BrandManager />);
        expect(await screen.findByText('Daikin')).toBeInTheDocument();
    });

    it('should show model count', async () => {
        render(<BrandManager />);
        await waitFor(() => {
            expect(screen.getByText((content, element) => {
                return element?.textContent === '5 models';
            })).toBeInTheDocument();
        });
    });
});
