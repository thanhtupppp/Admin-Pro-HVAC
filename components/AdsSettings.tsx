import React, { useState, useEffect } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../services/firebaseConfig';

interface AdConfig {
    enableAds: boolean;
    // Android IDs
    androidRewardedId: string;
    androidInterstitialId: string;
    androidBannerId: string;
    // iOS IDs
    iosRewardedId: string;
    iosInterstitialId: string;
    iosBannerId: string;
    // Placements
    showBannerHome: boolean;
    showBannerDetail: boolean;
    showInterstitialOnDetail: boolean;
    interstitialFrequency: number;
}

const DEFAULT_AD_CONFIG: AdConfig = {
    enableAds: true,
    androidRewardedId: 'ca-app-pub-3940256099942544/5224354917', // Test ID
    androidInterstitialId: 'ca-app-pub-3940256099942544/1033173712', // Test ID
    androidBannerId: 'ca-app-pub-3940256099942544/6300978111', // Test ID
    iosRewardedId: 'ca-app-pub-3940256099942544/1712485313', // Test ID
    iosInterstitialId: 'ca-app-pub-3940256099942544/4411468910', // Test ID
    iosBannerId: 'ca-app-pub-3940256099942544/2934735716', // Test ID
    showBannerHome: true,
    showBannerDetail: true,
    showInterstitialOnDetail: true,
    interstitialFrequency: 3,
};

const AdsSettings: React.FC = () => {
    const [config, setConfig] = useState<AdConfig>(DEFAULT_AD_CONFIG);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        fetchConfig();
    }, []);

    const fetchConfig = async () => {
        try {
            const docRef = doc(db, 'configurations', 'ads');
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                setConfig({ ...DEFAULT_AD_CONFIG, ...docSnap.data() as AdConfig });
            }
        } catch (error) {
            console.error('Error fetching ad config:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await setDoc(doc(db, 'configurations', 'ads'), config);
            alert('✅ Cập nhật cấu hình quảng cáo thành công!');
        } catch (error) {
            console.error('Error saving ad config:', error);
            alert('❌ Lỗi khi lưu cấu hình.');
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) return <div className="text-center text-text-secondary py-8">Đang tải cấu hình...</div>;

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-surface-dark border border-border-dark/30 rounded-3xl p-8 space-y-6 shadow-xl">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <span className="material-symbols-outlined text-amber-500">ad_units</span>
                        Cấu hình Quảng cáo (AdMob)
                    </h3>
                    <div className="flex items-center gap-2 bg-background-dark px-4 py-2 rounded-xl border border-border-dark">
                        <span className="text-sm font-bold text-text-secondary">Trạng thái:</span>
                        <div className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={config.enableAds}
                                onChange={(e) => setConfig({ ...config, enableAds: e.target.checked })}
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                        </div>
                        <span className={`text-sm font-bold ${config.enableAds ? 'text-green-500' : 'text-gray-500'}`}>
                            {config.enableAds ? 'Đang bật' : 'Đã tắt'}
                        </span>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Android Config */}
                    <div className="space-y-4">
                        <h4 className="text-sm font-bold text-green-400 flex items-center gap-2">
                            <span className="material-symbols-outlined">android</span>
                            Android Unit IDs
                        </h4>
                        
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-text-secondary uppercase">Rewarded Ad ID</label>
                            <input
                                type="text"
                                value={config.androidRewardedId}
                                onChange={(e) => setConfig({ ...config, androidRewardedId: e.target.value })}
                                className="w-full bg-background-dark border border-border-dark rounded-xl px-4 py-3 text-white font-mono text-xs focus:border-green-500 outline-none transition-colors"
                                placeholder="ca-app-pub-..."
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-text-secondary uppercase">Interstitial Ad ID</label>
                            <input
                                type="text"
                                value={config.androidInterstitialId}
                                onChange={(e) => setConfig({ ...config, androidInterstitialId: e.target.value })}
                                className="w-full bg-background-dark border border-border-dark rounded-xl px-4 py-3 text-white font-mono text-xs focus:border-green-500 outline-none transition-colors"
                                placeholder="ca-app-pub-..."
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-text-secondary uppercase">Banner Ad ID</label>
                            <input
                                type="text"
                                value={config.androidBannerId}
                                onChange={(e) => setConfig({ ...config, androidBannerId: e.target.value })}
                                className="w-full bg-background-dark border border-border-dark rounded-xl px-4 py-3 text-white font-mono text-xs focus:border-green-500 outline-none transition-colors"
                                placeholder="ca-app-pub-..."
                            />
                        </div>
                    </div>

                    {/* iOS Config */}
                    <div className="space-y-4">
                        <h4 className="text-sm font-bold text-blue-400 flex items-center gap-2">
                            <span className="material-symbols-outlined">ios</span>
                            iOS Unit IDs
                        </h4>
                        
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-text-secondary uppercase">Rewarded Ad ID</label>
                            <input
                                type="text"
                                value={config.iosRewardedId}
                                onChange={(e) => setConfig({ ...config, iosRewardedId: e.target.value })}
                                className="w-full bg-background-dark border border-border-dark rounded-xl px-4 py-3 text-white font-mono text-xs focus:border-blue-500 outline-none transition-colors"
                                placeholder="ca-app-pub-..."
                            />
                        </div>
                         <div className="space-y-2">
                            <label className="text-[10px] font-bold text-text-secondary uppercase">Interstitial Ad ID</label>
                            <input
                                type="text"
                                value={config.iosInterstitialId}
                                onChange={(e) => setConfig({ ...config, iosInterstitialId: e.target.value })}
                                className="w-full bg-background-dark border border-border-dark rounded-xl px-4 py-3 text-white font-mono text-xs focus:border-blue-500 outline-none transition-colors"
                                placeholder="ca-app-pub-..."
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-text-secondary uppercase">Banner Ad ID</label>
                            <input
                                type="text"
                                value={config.iosBannerId}
                                onChange={(e) => setConfig({ ...config, iosBannerId: e.target.value })}
                                className="w-full bg-background-dark border border-border-dark rounded-xl px-4 py-3 text-white font-mono text-xs focus:border-blue-500 outline-none transition-colors"
                                placeholder="ca-app-pub-..."
                            />
                        </div>
                    </div>
                </div>

                <div className="h-px bg-border-dark/50 my-6"></div>

                {/* Placements Config */}
                <div>
                     <h4 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary">layers</span>
                        Vị trí hiển thị (Placements)
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-3">
                            <label className="flex items-center gap-3 p-3 bg-background-dark rounded-xl border border-border-dark cursor-pointer hover:border-primary/50 transition-colors">
                                <input
                                    type="checkbox"
                                    checked={config.showBannerHome}
                                    onChange={(e) => setConfig({ ...config, showBannerHome: e.target.checked })}
                                    className="w-5 h-5 rounded border-gray-600 text-primary focus:ring-primary bg-transparent"
                                />
                                <span className="text-sm font-bold text-white">Banner trang chủ (Home)</span>
                            </label>

                             <label className="flex items-center gap-3 p-3 bg-background-dark rounded-xl border border-border-dark cursor-pointer hover:border-primary/50 transition-colors">
                                <input
                                    type="checkbox"
                                    checked={config.showBannerDetail}
                                    onChange={(e) => setConfig({ ...config, showBannerDetail: e.target.checked })}
                                    className="w-5 h-5 rounded border-gray-600 text-primary focus:ring-primary bg-transparent"
                                />
                                <span className="text-sm font-bold text-white">Banner chi tiết lỗi (Detail)</span>
                            </label>
                        </div>
                        
                        <div className="space-y-3">
                             <label className="flex items-center gap-3 p-3 bg-background-dark rounded-xl border border-border-dark cursor-pointer hover:border-primary/50 transition-colors">
                                <input
                                    type="checkbox"
                                    checked={config.showInterstitialOnDetail}
                                    onChange={(e) => setConfig({ ...config, showInterstitialOnDetail: e.target.checked })}
                                    className="w-5 h-5 rounded border-gray-600 text-primary focus:ring-primary bg-transparent"
                                />
                                <span className="text-sm font-bold text-white">Quảng cáo Popup khi xem lỗi (Interstitial)</span>
                            </label>
                            
                            <div className="p-3 bg-background-dark rounded-xl border border-border-dark">
                                    <label className="text-[10px] font-bold text-text-secondary uppercase block mb-2">
                                        Số lượt xem miễn phí (Free threshold)
                                    </label>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="number"
                                            min="0"
                                            value={config.interstitialFrequency}
                                            onChange={(e) => setConfig({ ...config, interstitialFrequency: parseInt(e.target.value) || 0 })}
                                            className="w-20 bg-surface-dark border border-border-dark rounded-lg px-3 py-1 text-white text-center font-bold"
                                        />
                                        <span className="text-xs text-text-secondary">lần xem đầu tiên, sau đó sẽ luôn hiện QC</span>
                                    </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end pt-4">
                     <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="px-6 py-2 bg-primary hover:bg-primary-hover text-white font-bold rounded-xl shadow-lg shadow-primary/20 transition-all flex items-center gap-2 disabled:opacity-50"
                    >
                        {isSaving ? (
                             <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        ) : (
                            <span className="material-symbols-outlined text-[20px]">save</span>
                        )}
                        Lưu cấu hình
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AdsSettings;
