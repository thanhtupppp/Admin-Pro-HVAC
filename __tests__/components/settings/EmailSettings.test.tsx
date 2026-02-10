
import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import EmailSettings from '../../../components/EmailSettings';
import { emailService } from '../../../services/emailService';

jest.mock('../../../services/emailService');

describe('EmailSettings', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        (emailService.getConfig as jest.Mock).mockReturnValue({
            serviceId: 'svc-123',
            publicKey: 'pk-456',
            templates: {
                welcome: 'tpl_welcome',
                paymentPending: 'tpl_pending',
                paymentSuccess: 'tpl_success',
                planActivated: 'tpl_activated'
            }
        });
        (emailService.saveConfig as jest.Mock).mockImplementation(() => {});
        (emailService.sendTestEmail as jest.Mock).mockResolvedValue(true);
        window.alert = jest.fn();
    });

    it('should render email settings', async () => {
        render(<EmailSettings />);
        await waitFor(() => {
            expect(screen.getByDisplayValue('svc-123')).toBeInTheDocument();
        });
    });

    it('should save settings', async () => {
        render(<EmailSettings />);
        await waitFor(() => screen.getByDisplayValue('svc-123'));

        const saveBtn = screen.getByText('Lưu cấu hình');
        fireEvent.click(saveBtn);

        await waitFor(() => {
            expect(emailService.saveConfig).toHaveBeenCalled();
        });
    });
});
