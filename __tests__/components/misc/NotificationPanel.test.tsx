
import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import NotificationPanel from '../../../components/NotificationPanel';

describe('NotificationPanel', () => {
    const defaultProps = {
        notifications: [
            { id: '1', title: 'Test Notif', message: 'Msg', type: 'info', read: false, timestamp: 'now' }
        ] as any,
        unreadCount: 1,
        onClose: jest.fn(),
        onMarkAllRead: jest.fn()
    };

    it('should render notifications', () => {
        render(<NotificationPanel {...defaultProps} />);
        expect(screen.getByText('Test Notif')).toBeInTheDocument();
        expect(screen.getByText('Msg')).toBeInTheDocument();
    });

    it('should mark all read', () => {
        render(<NotificationPanel {...defaultProps} />);
        const markBtn = screen.getByText('Đánh dấu đã đọc');
        fireEvent.click(markBtn);
        expect(defaultProps.onMarkAllRead).toHaveBeenCalled();
    });

    it('should close panel', () => {
        render(<NotificationPanel {...defaultProps} />);
        // Close button usually has an icon, check component
        // Component has close icon "close"
        const closeBtn = screen.getByText('close'); 
        fireEvent.click(closeBtn);
        expect(defaultProps.onClose).toHaveBeenCalled();
    });
});
