
import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import StatCard from '../../../components/StatCard';

// Mock TrendIndicator since we test it separately
jest.mock('../../../components/TrendIndicator', () => () => <div data-testid="trend-indicator" />);

describe('StatCard', () => {
    it('should render title and value', () => {
        render(<StatCard title="Total Users" value={100} icon="group" />);
        expect(screen.getByText('Total Users')).toBeInTheDocument();
        expect(screen.getByText('100')).toBeInTheDocument();
    });

    it('should render formatted number', () => {
        render(<StatCard title="Revenue" value={1000} icon="attach_money" />);
        // 1,000 depending on locale, mock locale string if needed but usually verifies content
        expect(screen.getByText(/1.?000/)).toBeInTheDocument();
    });

    it('should not render if visible is false', () => {
        const { container } = render(<StatCard title="Hidden" value={0} icon="hide" isVisible={false} />);
        expect(container.firstChild).toBeNull();
    });

    it('should render subtitle if provided', () => {
        render(<StatCard title="Title" value={0} icon="icon" subtitle="Test Subtitle" />);
        expect(screen.getByText('Test Subtitle')).toBeInTheDocument();
    });

    it('should render trend indicator if trend prop provided', () => {
        render(<StatCard title="Trend" value={0} icon="chart" trend={10} />);
        expect(screen.getByTestId('trend-indicator')).toBeInTheDocument();
    });
});
