
import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import Login from '../../../components/Login';
import { authService } from '../../../services/authService';

jest.mock('../../../services/authService', () => ({
    authService: {
        signIn: jest.fn(),
        signUp: jest.fn(),
        signOut: jest.fn(),
        getCurrentUser: jest.fn()
    }
}));

describe('Login', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should render login form', () => {
        render(<Login onLoginSuccess={jest.fn()} />);
        expect(screen.getByPlaceholderText('admin@service.vn')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('••••••••')).toBeInTheDocument();
    });

    it('should handle successful login', async () => {
        const onLoginSuccess = jest.fn();
        (authService.signIn as jest.Mock).mockResolvedValue({ success: true, user: { uid: 'u1' } });

        render(<Login onLoginSuccess={onLoginSuccess} />);

        fireEvent.change(screen.getByPlaceholderText('admin@service.vn'), { target: { value: 'admin@test.com' } });
        fireEvent.change(screen.getByPlaceholderText('••••••••'), { target: { value: 'password123' } });
        
        const submitBtn = screen.getByRole('button', { name: /đăng nhập ngay/i });
        fireEvent.click(submitBtn);

        await waitFor(() => {
            expect(authService.signIn).toHaveBeenCalledWith('admin@test.com', 'password123');
            expect(onLoginSuccess).toHaveBeenCalled();
        });
    });

    it('should show error on failure', async () => {
        (authService.signIn as jest.Mock).mockResolvedValue({ success: false, error: 'Invalid credentials' });

        render(<Login onLoginSuccess={jest.fn()} />);

        fireEvent.change(screen.getByPlaceholderText('admin@service.vn'), { target: { value: 'wrong@test.com' } });
        fireEvent.change(screen.getByPlaceholderText('••••••••'), { target: { value: 'wrongpass' } });
        
        fireEvent.click(screen.getByRole('button', { name: /đăng nhập ngay/i }));

        expect(await screen.findByText('Invalid credentials')).toBeInTheDocument();
    });
});
