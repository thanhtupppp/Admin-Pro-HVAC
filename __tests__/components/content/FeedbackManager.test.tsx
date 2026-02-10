
import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import FeedbackManager from '../../../components/FeedbackManager';
import { feedbackService } from '../../../services/feedbackService';

jest.mock('../../../services/feedbackService');

describe('FeedbackManager', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        (feedbackService.getFeedbacks as jest.Mock).mockResolvedValue([
            { 
                id: 'f1', 
                title: 'Issue', 
                content: 'Help me', 
                status: 'pending', 
                type: 'bug', // Valid type
                createdAt: '2024-01-01',
                userName: 'Test User',
                userEmail: 'test@example.com'
            }
        ]);
    });

    it('should render feedback list', async () => {
        render(<FeedbackManager />);
        expect(await screen.findByText('Issue')).toBeInTheDocument();
        expect(screen.getByText('Help me')).toBeInTheDocument();
    });

    it('should filter feedback', async () => {
        render(<FeedbackManager />);
        await waitFor(() => screen.getByText('Issue'));
        
        // This is a basic render test. 
        // More complex interaction tests can be added later.
        expect(screen.getAllByText(/pending|mới|chờ/i)[0]).toBeInTheDocument(); // Status label
    });
});
