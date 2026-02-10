
import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import AdsSettings from '../../../components/AdsSettings';
import { doc, getDoc, setDoc } from 'firebase/firestore';

// Mock Firebase
jest.mock('../../../services/firebaseConfig', () => ({
    db: {}
}));
jest.mock('firebase/firestore', () => ({
    doc: jest.fn(() => ({})),
    getDoc: jest.fn(),
    setDoc: jest.fn(),
    Timestamp: { now: jest.fn() }
}));

describe('AdsSettings', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        (getDoc as jest.Mock).mockResolvedValue({
            exists: () => true,
            data: () => ({
                enableAds: true,
                androidBannerId: 'ca-app-pub-test',
                androidRewardedId: 'ca-app-pub-rewarded',
                androidInterstitialId: 'ca-app-pub-interstitial',
                iosRewardedId: 'ca-app-pub-ios-reward',
                iosInterstitialId: 'ca-app-pub-ios-interstitial',
                iosBannerId: 'ca-app-pub-ios-banner',
                showBannerHome: true,
                showBannerDetail: true,
                showInterstitialOnDetail: true,
                interstitialFrequency: 3
            })
        });
        window.alert = jest.fn();
    });

    it('should load settings on mount', async () => {
        render(<AdsSettings />);
        await waitFor(() => {
            expect(getDoc).toHaveBeenCalled();
            expect(screen.getByDisplayValue('ca-app-pub-test')).toBeInTheDocument();
        });
    });

    it('should save settings', async () => {
        (setDoc as jest.Mock).mockResolvedValue(undefined);
        render(<AdsSettings />);
        await waitFor(() => screen.getByDisplayValue('ca-app-pub-test'));

        const saveBtn = screen.getByText('Lưu cấu hình');
        fireEvent.click(saveBtn);

        await waitFor(() => {
            expect(setDoc).toHaveBeenCalled();
        });
    });
});
