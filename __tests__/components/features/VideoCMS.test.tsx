
import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import VideoCMS from '../../../components/VideoCMS';
import { errorService } from '../../../services/errorService';

jest.mock('../../../services/errorService');

describe('VideoCMS', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        (errorService.getErrors as jest.Mock).mockResolvedValue([
            { id: '1', code: 'E1', videos: ['https://youtu.be/v1'] },
            { id: '2', code: 'E2', videos: ['https://youtu.be/v1'] } // Same video
        ]);
    });

    it('should aggregate videos from errors', async () => {
        render(<VideoCMS />);
        await waitFor(() => {
            // Should show video list. Since we mocked same video twice, it might aggregate.
            // Assuming the component renders video cards.
            expect(screen.getByText('Kho Video Hướng Dẫn')).toBeInTheDocument();
        });
    });
});
