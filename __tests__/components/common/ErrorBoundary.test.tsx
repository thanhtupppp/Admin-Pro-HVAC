
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import ErrorBoundary from '../../../components/ErrorBoundary';

// Component that throws error
const ThrowError = () => {
    throw new Error('Test Error');
};

describe('ErrorBoundary', () => {
    // Suppress console.error for these tests as we expect errors
    const originalError = console.error;
    beforeAll(() => {
        console.error = jest.fn();
    });

    afterAll(() => {
        console.error = originalError;
    });

    it('should render children when no error', () => {
        render(
            <ErrorBoundary>
                <div>Safe Content</div>
            </ErrorBoundary>
        );
        expect(screen.getByText('Safe Content')).toBeInTheDocument();
    });

    it('should render fallback UI when error occurs', () => {
        render(
            <ErrorBoundary>
                <ThrowError />
            </ErrorBoundary>
        );
        expect(screen.getByText('Đã xảy ra lỗi')).toBeInTheDocument();
        expect(screen.getByText('Tải lại trang')).toBeInTheDocument();
    });

    it('should call onError prop if provided', () => {
        const onError = jest.fn();
        render(
            <ErrorBoundary onError={onError}>
                <ThrowError />
            </ErrorBoundary>
        );
        expect(onError).toHaveBeenCalled();
    });

    it('should render reload button when error occurs', () => {
        render(
            <ErrorBoundary>
                <ThrowError />
            </ErrorBoundary>
        );

        const reloadButton = screen.getByText('Tải lại trang');
        expect(reloadButton).toBeInTheDocument();
        expect(reloadButton.tagName).toBe('BUTTON');
    });
});
