
import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import UserManager from '../../../components/UserManager';
import { userService } from '../../../services/userService';

jest.mock('../../../services/userService');

describe('UserManager', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        (userService.getUsers as jest.Mock).mockResolvedValue([
            { 
                id: 'u1', 
                email: 'admin@example.com', 
                role: 'admin',
                displayName: 'Admin User',
                username: 'admin',
                status: 'active',
                lastLogin: '2024-01-01' 
            }
        ]);
        (userService.createUser as jest.Mock).mockResolvedValue({ id: 'u2' });
    });

    it('should render users', async () => {
        render(<UserManager />);
        expect(await screen.findByText('admin@example.com')).toBeInTheDocument();
    });

    it('should open modal for new user', async () => {
        render(<UserManager />);
        await screen.findByText('admin@example.com');
        
        fireEvent.click(screen.getByText('Thêm User'));
        expect(screen.getByText('Thêm User Mới')).toBeInTheDocument();
    });
});
