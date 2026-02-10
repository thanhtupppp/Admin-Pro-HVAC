
import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import DashboardCharts from '../../../components/DashboardCharts';

// Mock Recharts to avoid complex DOM testing and ResizeObserver issues
jest.mock('recharts', () => ({
    ResponsiveContainer: ({ children }: any) => <div>{children}</div>,
    LineChart: () => <div>LineChart</div>,
    BarChart: () => <div>BarChart</div>,
    PieChart: () => <div>PieChart</div>,
    Line: () => null,
    Bar: () => null,
    Pie: () => null,
    Cell: () => null,
    XAxis: () => null,
    YAxis: () => null,
    CartesianGrid: () => null,
    Tooltip: () => null,
    Legend: () => null,
}));

describe('DashboardCharts', () => {
    const mockTransactions = [
        { id: 't1', amount: 100, createdAt: '2024-01-01' },
    ];
    const mockUsers = [
        { id: 'u1', role: 'User', plan: 'Free', createdAt: '2024-01-01' },
    ];

    it('should render all chart widgets', () => {
        render(<DashboardCharts transactions={mockTransactions as any} users={mockUsers as any} />);
        
        // Check for section titles (assuming they appear in component)
        // Or check for mocked charts
        expect(screen.getAllByText('LineChart').length).toBeGreaterThan(0);
        expect(screen.getAllByText('BarChart').length).toBeGreaterThan(0);
        expect(screen.getAllByText('PieChart').length).toBeGreaterThan(0);
    });

    it('should render without crashing with empty data', () => {
        render(<DashboardCharts transactions={[]} users={[]} />);
        expect(screen.getByText('LineChart')).toBeInTheDocument();
    });
});
