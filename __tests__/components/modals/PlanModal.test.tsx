
import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import PlanModal from '../../../components/PlanModal';
import { planService } from '../../../services/planService';

jest.mock('../../../services/planService');

describe('PlanModal', () => {
    const mockPlan = {
        id: 'p1',
        name: 'Basic Plan',
        price: 100,
        billingCycle: 'monthly',
        features: ['Feature 1']
    };

    beforeEach(() => {
        jest.clearAllMocks();
        jest.spyOn(window, 'alert').mockImplementation(() => {});
        jest.spyOn(console, 'error').mockImplementation(() => {});
        (planService.createPlan as jest.Mock).mockResolvedValue('p_new');
        (planService.updatePlan as jest.Mock).mockImplementation((...args) => {
            console.log('updatePlan called with:', JSON.stringify(args, null, 2));
            return Promise.resolve(true);
        });
    });

    it('should render empty form for new plan', () => {
        render(<PlanModal plan={null} onClose={jest.fn()} onSave={jest.fn()} />);
        expect(screen.getByText('Tạo gói dịch vụ mới')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('free')).toHaveValue(''); // Name input empty
    });

    it('should render existing plan data', () => {
        render(<PlanModal plan={mockPlan as any} onClose={jest.fn()} onSave={jest.fn()} />);
        expect(screen.getByDisplayValue('Basic Plan')).toBeInTheDocument();
        expect(screen.getByDisplayValue('100')).toBeInTheDocument();
    });

    it('should save new plan', async () => {
        const onSave = jest.fn();
        render(<PlanModal plan={null} onClose={jest.fn()} onSave={onSave} />);

        fireEvent.change(screen.getByPlaceholderText('free'), { target: { value: 'New Plan' } });
        fireEvent.change(screen.getByPlaceholderText('199000'), { target: { value: '200' } });
        
        const form = screen.getByPlaceholderText('free').closest('form');
        fireEvent.submit(form!);

        await waitFor(() => {
            expect(planService.createPlan).toHaveBeenCalledWith(expect.objectContaining({
                name: 'New Plan',
                price: 200
            }));
            expect(onSave).toHaveBeenCalled();
        });
    });

    it('should update existing plan', async () => {
        const onSave = jest.fn();
        render(<PlanModal plan={mockPlan as any} onClose={jest.fn()} onSave={onSave} />);

        fireEvent.change(screen.getByPlaceholderText('free'), { target: { value: 'Updated Plan' } });
        const form = screen.getByPlaceholderText('free').closest('form');
        fireEvent.submit(form!);

        await waitFor(() => {
            expect(planService.updatePlan).toHaveBeenCalledWith('p1', expect.objectContaining({
                name: 'Updated Plan'
            }));
            expect(onSave).toHaveBeenCalled();
        });
    });
});
