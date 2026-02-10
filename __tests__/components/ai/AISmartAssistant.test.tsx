
import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import AISmartAssistant from '../../../components/AISmartAssistant';
import { chatWithAI } from '../../../components/AIService';

jest.mock('../../../components/AIService', () => ({
    chatWithAI: jest.fn()
}));

describe('AISmartAssistant', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        // Mock scrollIntoView since jsdom doesn't support it
        window.HTMLElement.prototype.scrollIntoView = jest.fn();
    });

    it('should open chat on button click', async () => {
        render(<AISmartAssistant />);
        const openBtn = screen.getByRole('button');
        fireEvent.click(openBtn);
        expect(await screen.findByText('AI Thinking Expert')).toBeInTheDocument();
    });

    it('should send message and get response', async () => {
        (chatWithAI as jest.Mock).mockResolvedValue('Here is the solution.');
        render(<AISmartAssistant />);
        
        // Open chat
        fireEvent.click(screen.getByRole('button'));
        
        // Type input
        const input = await screen.findByPlaceholderText('Nhập yêu cầu phân tích...');
        fireEvent.change(input, { target: { value: 'Fix error 101' } });
        
        // Send
        const sendBtn = screen.getByRole('button', { name: /send/ });
        fireEvent.click(sendBtn);

        // Check for thinking state
        expect(await screen.findByText('Đang phân tích sâu câu hỏi của bạn...')).toBeInTheDocument();

        // Check for response
        await waitFor(() => {
            expect(screen.getByText('Here is the solution.')).toBeInTheDocument();
        });
    });
});
