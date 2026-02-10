
import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import VietQRSettings from '../../../components/VietQRSettings';
import { bankSettingsService } from '../../../services/bankSettingsService';

jest.mock('../../../services/bankSettingsService');

describe('VietQRSettings', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        (bankSettingsService.getBankSettings as jest.Mock).mockResolvedValue({
            bankId: 'VCB',
            accountNumber: '123456',
            accountName: 'Tech Company'
        });
        (bankSettingsService.updateBankSettings as jest.Mock).mockResolvedValue(undefined);
        (bankSettingsService.getSupportedBanks as jest.Mock).mockReturnValue([
            { id: 'VCB', name: 'Vietcombank' },
            { id: 'ICB', name: 'VietinBank' }
        ]);
        window.alert = jest.fn();
    });

    it('should render qr settings', async () => {
        render(<VietQRSettings />);
        await waitFor(() => {
            expect(screen.getByDisplayValue('123456')).toBeInTheDocument();
        });
    });

    it('should save qr settings', async () => {
        render(<VietQRSettings />);
        await waitFor(() => screen.getByDisplayValue('123456'));

        // Click Edit
        fireEvent.click(screen.getByText('Chỉnh sửa'));

        fireEvent.change(screen.getByDisplayValue('123456'), { target: { value: '999999' } });
        
        const saveBtn = screen.getByText('Lưu');
        fireEvent.click(saveBtn);

        await waitFor(() => {
            expect(bankSettingsService.updateBankSettings).toHaveBeenCalled();
        });
    });
});
