
import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import AlertBox from '../../../components/AlertBox';

describe('AlertBox', () => {
    it('should render title and message', () => {
        render(<AlertBox type="info" title="Test Title" message="Test Message" />);
        expect(screen.getByText('Test Title')).toBeInTheDocument();
        expect(screen.getByText('Test Message')).toBeInTheDocument();
    });

    it('should render timestamp when provided', () => {
        render(<AlertBox type="info" title="Title" message="Message" timestamp="12:00 PM" />);
        expect(screen.getByText('12:00 PM')).toBeInTheDocument();
    });

    it('should render correct style for error', () => {
        const { container } = render(<AlertBox type="error" title="Error" message="Failed" />);
        // Checking for error specific class or icon
        expect(screen.getByText('⛔')).toBeInTheDocument();
        const alertDiv = container.firstChild as HTMLElement;
        expect(alertDiv.className).toContain('bg-status-error/5');
    });

    it('should render correct style for info', () => {
        render(<AlertBox type="info" title="Info" message="Info msg" />);
        expect(screen.getByText('ℹ️')).toBeInTheDocument();
    });

    it('should render correct style for warn', () => {
        render(<AlertBox type="warn" title="Warning" message="Warn msg" />);
        expect(screen.getByText('⚠')).toBeInTheDocument();
    });
});
