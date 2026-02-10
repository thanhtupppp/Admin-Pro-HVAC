
import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import BackupManager from '../../../components/BackupManager';
import { exportService } from '../../../services/exportService';

jest.mock('../../../services/exportService');

describe('BackupManager', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        (exportService.exportUsers as jest.Mock).mockResolvedValue({ success: true, count: 5 });
        (exportService.fullBackup as jest.Mock).mockResolvedValue({ success: true, stats: {} });
    });

    it('should render backup options', () => {
        render(<BackupManager />);
        expect(screen.getByText('Backup & Export Data')).toBeInTheDocument();
        expect(screen.getByText('Backup Now')).toBeInTheDocument();
    });

    it('should trigger export', async () => {
        render(<BackupManager />);
        const backupBtn = screen.getByText('Backup Now');
        fireEvent.click(backupBtn);
        
        await waitFor(() => {
            expect(exportService.fullBackup).toHaveBeenCalled();
        });
    });
});
