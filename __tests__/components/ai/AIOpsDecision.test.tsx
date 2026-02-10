
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import AIOpsDecision from '../../../components/AIOpsDecision';
import { metricsService } from '../../../services/metricsService';

jest.mock('../../../services/metricsService');

describe('AIOpsDecision', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        (metricsService.subscribeToMetrics as jest.Mock).mockImplementation((callback: (metrics: any) => void) => {
            callback({
                requestsUsed: 50,
                requestsLimit: 100,
                tokensInput: 1000,
                tokensOutput: 500,
                estimatedCost: 0.05,
                model: 'gemini-pro'
            });
            return () => {}; // unsubscribe function
        });
    });

    it('should render usage data', async () => {
        render(<AIOpsDecision />);
        // The component formats tokens as "1.0K" not "1000"
        expect(await screen.findByText('1.0K')).toBeInTheDocument(); // tokens input formatted
        expect(screen.getByText('0.5K')).toBeInTheDocument(); // tokens output formatted
        expect(screen.getByText('gemini-pro')).toBeInTheDocument();
    });
});
