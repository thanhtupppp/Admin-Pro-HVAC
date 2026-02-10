
import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import StatusCard from '../../../components/IndustrialStatusCard';

// Using StatusCard from IndustrialStatusCard.tsx (default export)
describe('IndustrialStatusCard', () => {
    it('should render label and value', () => {
        render(<StatusCard label="Test Label" value="123" />);
        expect(screen.getByText('Test Label')).toBeInTheDocument();
        expect(screen.getByText('123')).toBeInTheDocument();
    });

    it('should render unit if provided', () => {
        render(<StatusCard label="Pressure" value={100} unit="PSI" />);
        expect(screen.getByText('PSI')).toBeInTheDocument();
    });

    it('should render different statuses', () => {
        const { rerender, container } = render(<StatusCard label="Status" value="OK" status="ok" />);
        expect(screen.getByText('● Hoạt động bình thường')).toBeInTheDocument();

        rerender(<StatusCard label="Status" value="WARN" status="warn" />);
        expect(screen.getByText('⚠ Cảnh báo')).toBeInTheDocument();

        rerender(<StatusCard label="Status" value="ERR" status="error" />);
        expect(screen.getByText('⛔ Lỗi')).toBeInTheDocument();
    });
});
