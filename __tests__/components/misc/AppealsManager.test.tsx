
import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import AppealsManager from '../../../components/AppealsManager';
import { getDocs, updateDoc } from 'firebase/firestore';

jest.mock('../../../services/firebaseConfig', () => ({
    db: {}
}));
jest.mock('firebase/firestore', () => ({
    collection: jest.fn(),
    query: jest.fn(),
    orderBy: jest.fn(),
    getDocs: jest.fn(),
    doc: jest.fn(),
    updateDoc: jest.fn(),
    deleteDoc: jest.fn(),
    Timestamp: { now: jest.fn() }
}));

describe('AppealsManager', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        (getDocs as jest.Mock).mockResolvedValue({
            docs: [{
                id: 'a1',
                data: () => ({
                    userId: 'u1',
                    userEmail: 'user@test.com',
                    reason: 'Unlock me',
                    status: 'pending',
                    createdAt: { toDate: () => new Date() }
                })
            }]
        });
        window.alert = jest.fn();
        window.confirm = jest.fn(() => true);
    });

    it('should render appeals', async () => {
        render(<AppealsManager />);
        await waitFor(() => {
            expect(screen.getByText('user@test.com')).toBeInTheDocument();
            expect(screen.getByText('" Unlock me "')).toBeInTheDocument();
        });
    });

    it('should approve appeal', async () => {
        render(<AppealsManager />);
        await waitFor(() => screen.getByText('user@test.com'));

        const approveBtn = screen.getByText('Mở khóa');
        fireEvent.click(approveBtn);

        await waitFor(() => {
            expect(updateDoc).toHaveBeenCalledTimes(2); // Unlock user and update appeal
            expect(window.alert).toHaveBeenCalledWith('Đã mở khóa tài khoản thành công!');
        });
    });
});
