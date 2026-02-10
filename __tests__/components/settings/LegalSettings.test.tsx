
import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import LegalSettings from '../../../components/LegalSettings';
import { getDoc, setDoc, Timestamp } from 'firebase/firestore';

jest.mock('../../../services/firebaseConfig', () => ({
    db: {}
}));
jest.mock('firebase/firestore', () => ({
    doc: jest.fn(() => ({})),
    getDoc: jest.fn(),
    setDoc: jest.fn(),
    Timestamp: { now: jest.fn(() => ({ toDate: () => new Date() })) }
}));

describe('LegalSettings', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        (getDoc as jest.Mock).mockResolvedValue({
            exists: () => true,
            data: () => ({
                termsOfService: 'Terms content here',
                privacyPolicy: 'Privacy content here'
            })
        });
        window.alert = jest.fn();
    });

    it('should load legal content', async () => {
        render(<LegalSettings />);
        await waitFor(() => {
            // Terms displayed in textarea
            expect(screen.getByDisplayValue('Terms content here')).toBeInTheDocument();
        });
    });

    it('should save content', async () => {
        (setDoc as jest.Mock).mockResolvedValue(undefined);
        render(<LegalSettings />);
        await waitFor(() => screen.getByDisplayValue('Terms content here'));

        const saveBtn = screen.getByText('Lưu thay đổi');
        fireEvent.click(saveBtn);

        await waitFor(() => {
            expect(setDoc).toHaveBeenCalled();
        });
    });
});
