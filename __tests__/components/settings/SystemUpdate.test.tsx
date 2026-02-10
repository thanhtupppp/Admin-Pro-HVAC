
import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import SystemUpdate from '../../../components/SystemUpdate';
import { systemService } from '../../../services/systemService';

jest.mock('../../../services/systemService');

describe('SystemUpdate', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        (systemService.checkForUpdates as jest.Mock).mockResolvedValue({
            version: 'v3.5.0-beta',
            releaseDate: '2024-03-15',
            notes: ['New features', 'Bug fixes'],
            isCritical: false
        });
    });

    it('should check for updates on manual action', async () => {
        render(<SystemUpdate />);
        
        fireEvent.click(screen.getByText('Kiểm tra cập nhật'));

        expect(await screen.findByText('Phiên bản mới v3.5.0-beta', {}, { timeout: 3000 })).toBeInTheDocument();
    });
});
