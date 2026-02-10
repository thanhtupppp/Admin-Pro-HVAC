
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ServicePlans from '../../../components/ServicePlans';
import { planService } from '../../../services/planService';

jest.mock('../../../services/planService');

describe('ServicePlans', () => {
    const mockPlans = [
        { id: 'p1', name: 'Basic', price: 0, features: ['Feature 1'], tier: 'Basic', description: 'Basic plan' },
        { id: 'p2', name: 'Pro', price: 200000, features: ['Feature 1', 'Feature 2'], tier: 'Premium', description: 'Pro plan' },
        { id: 'p3', name: 'Enterprise', price: 500000, features: ['All features'], tier: 'Enterprise', description: 'Enterprise plan' }
    ];

    beforeEach(() => {
        jest.clearAllMocks();
        (planService.getPlans as jest.Mock).mockResolvedValue(mockPlans);
    });

    it('should render header', async () => {
        render(<ServicePlans />);
        await waitFor(() => {
            expect(screen.getByText(/Chọn gói phù hợp với bạn/i)).toBeInTheDocument();
        }, { timeout: 3000 });
    });

    it('should render plan names', async () => {
        render(<ServicePlans />);
        await waitFor(() => {
            expect(screen.getAllByText('Pro').length).toBeGreaterThan(0);
        }, { timeout: 3000 });
    });
});
