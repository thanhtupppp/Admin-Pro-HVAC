
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import SecurityLogs from '../../../components/SecurityLogs';
import { securityService } from '../../../services/securityService';

jest.mock('../../../services/securityService');
jest.mock('date-fns', () => ({
    format: jest.fn(() => '01/01/2024 00:00:00'),
}));
jest.mock('date-fns/locale', () => ({
    vi: {},
}));

describe('SecurityLogs', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        (securityService.getSuspiciousActivities as jest.Mock).mockResolvedValue([
            { id: 'v1', type: 'login_fail', userId: 'u1', userEmail: 'test@test.com', reason: 'Wrong password', count: 3, timestamp: '2024-01-01', platform: 'web', ip: '127.0.0.1' }
        ]);
    });

    it('should render logs', async () => {
        render(<SecurityLogs />);
        // Component renders userEmail and count in the table
        expect(await screen.findByText('test@test.com')).toBeInTheDocument();
        expect(screen.getByText(/3 lần/)).toBeInTheDocument();
    });
});
