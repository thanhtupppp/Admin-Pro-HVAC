
import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import TagManager from '../../../components/TagManager';
import { tagService } from '../../../services/tagService';

jest.mock('../../../services/tagService');

describe('TagManager', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        (tagService.getAllTags as jest.Mock).mockResolvedValue([
            { id: 't1', name: 'Urgent', color: '#FF0000', count: 10, description: 'High priority' }
        ]);
    });

    it('should render tags', async () => {
        render(<TagManager />);
        await waitFor(() => {
            expect(screen.getByText('Urgent')).toBeInTheDocument();
            expect(screen.getByText('10 docs')).toBeInTheDocument();
        });
    });

    it('should open modal on create click', async () => {
        render(<TagManager />);
        await waitFor(() => screen.getByText('Urgent'));
        
        fireEvent.click(screen.getByText('Tạo tag'));
        expect(screen.getByText('Tạo tag mới')).toBeInTheDocument();
    });
});
