
import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import Settings from '../../../components/Settings';
import { systemService } from '../../../services/systemService';

jest.mock('../../../services/systemService');
jest.mock('../../../components/VietQRSettings', () => () => <div>VietQRSettings</div>);
jest.mock('../../../components/BackupManager', () => () => <div>BackupManager</div>);
jest.mock('../../../components/EmailSettings', () => () => <div>EmailSettings</div>);
jest.mock('../../../components/AdsSettings', () => () => <div>AdsSettings</div>);

describe('Settings', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        (systemService.getSettings as jest.Mock).mockResolvedValue({
            appName: 'Admin Pro Console',
            maintenanceMode: false,
            aiBudget: 32768,
            aiModel: 'gemini-2.5-flash',
            geminiApiKey: 'test-key'
        });
        (systemService.updateSettings as jest.Mock).mockResolvedValue(true);
    });

    it('should render settings form', async () => {
        render(<Settings />);
        expect(await screen.findByDisplayValue('Admin Pro Console')).toBeInTheDocument();
    });

    it('should handle save', async () => {
        render(<Settings />);
        await screen.findByDisplayValue('Admin Pro Console');
        
        fireEvent.click(screen.getByText('Lưu thay đổi'));
        
        await waitFor(() => {
            expect(systemService.updateSettings).toHaveBeenCalled();
        });
    });
});
