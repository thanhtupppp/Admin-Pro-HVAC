
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import Tooltip from '../../../components/Tooltip';

describe('Tooltip', () => {
    it('should render children correctly', () => {
        render(<Tooltip text="Help info"><button>Hover me</button></Tooltip>);
        expect(screen.getByText('Hover me')).toBeInTheDocument();
    });

    it('should show tooltip text on hover', () => {
        render(<Tooltip text="Help info"><button>Hover me</button></Tooltip>);
        
        // The onMouseEnter is on the wrapper div, not the button directly
        const button = screen.getByText('Hover me');
        const wrapper = button.closest('.relative');

        // Initially not visible
        expect(screen.queryByText('Help info')).not.toBeInTheDocument();

        // Mouse enter on wrapper
        if (wrapper) fireEvent.mouseEnter(wrapper);
        expect(screen.getByText('Help info')).toBeInTheDocument();

        // Mouse leave
        if (wrapper) fireEvent.mouseLeave(wrapper);
        expect(screen.queryByText('Help info')).not.toBeInTheDocument();
    });
});
