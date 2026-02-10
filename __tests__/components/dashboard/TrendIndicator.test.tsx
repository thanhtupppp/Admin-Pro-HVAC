
import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import TrendIndicator from '../../../components/TrendIndicator';

describe('TrendIndicator', () => {
    it('should render positive trend', () => {
        render(<TrendIndicator value={10} />);
        expect(screen.getByText('10.0%')).toBeInTheDocument();
        expect(screen.getByText('▲')).toBeInTheDocument(); // Positive arrow
    });

    it('should render negative trend', () => {
        render(<TrendIndicator value={-5} />);
        expect(screen.getByText('5.0%')).toBeInTheDocument(); // Absolute value
        expect(screen.getByText('▼')).toBeInTheDocument();
    });

    it('should render correct period text', () => {
        render(<TrendIndicator value={10} period="week" />);
        expect(screen.getByText(/vs tuần trước/)).toBeInTheDocument();
    });
});
