import 'package:flutter/foundation.dart';
import 'package:google_mobile_ads/google_mobile_ads.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:shared_preferences/shared_preferences.dart';

class AdConfig {
  final bool enableAds;
  final String androidRewardedId;
  final String androidInterstitialId;
  final String androidBannerId;
  final String iosRewardedId;
  final String iosInterstitialId;
  final String iosBannerId;
  final bool showBannerHome;
  final bool showBannerDetail;
  final bool showInterstitialOnDetail;
  final int interstitialFrequency;

  AdConfig({
    this.enableAds = true,
    // Production Ad IDs (Android)
    this.androidRewardedId =
        'ca-app-pub-2362828741155079/9746295670', // Production Rewarded ID
    this.androidInterstitialId = 'ca-app-pub-2362828741155079/1341093986',
    this.androidBannerId = 'ca-app-pub-2362828741155079/3699762077',
    // iOS - still test IDs (update when iOS version ready)
    this.iosRewardedId = 'ca-app-pub-3940256099942544/1712485313',
    this.iosInterstitialId = 'ca-app-pub-3940256099942544/4411468910',
    this.iosBannerId = 'ca-app-pub-3940256099942544/2934735716',
    this.showBannerHome = true,
    this.showBannerDetail = true,
    this.showInterstitialOnDetail = true,
    this.interstitialFrequency = 3,
  });

  factory AdConfig.fromMap(Map<String, dynamic> map) {
    return AdConfig(
      enableAds: map['enableAds'] ?? true,
      androidRewardedId:
          map['androidRewardedId'] ?? 'ca-app-pub-2362828741155079/9746295670',
      androidInterstitialId:
          map['androidInterstitialId'] ??
          'ca-app-pub-2362828741155079/1341093986',
      androidBannerId:
          map['androidBannerId'] ?? 'ca-app-pub-2362828741155079/3699762077',
      iosRewardedId:
          map['iosRewardedId'] ?? 'ca-app-pub-3940256099942544/1712485313',
      iosInterstitialId:
          map['iosInterstitialId'] ?? 'ca-app-pub-3940256099942544/4411468910',
      iosBannerId:
          map['iosBannerId'] ?? 'ca-app-pub-3940256099942544/2934735716',
      showBannerHome: map['showBannerHome'] ?? true,
      showBannerDetail: map['showBannerDetail'] ?? true,
      showInterstitialOnDetail: map['showInterstitialOnDetail'] ?? true,
      interstitialFrequency: map['interstitialFrequency'] ?? 3,
    );
  }
}

class AdService {
  static final AdService _instance = AdService._internal();
  factory AdService() => _instance;
  AdService._internal();

  RewardedAd? _rewardedAd;
  InterstitialAd? _interstitialAd;
  bool _isAdLoading = false;
  bool _isAdReady = false;

  AdConfig _config = AdConfig();
  int _detailViewCount = 0;

  /// Initialize AdMob and fetch config
  static Future<void> initialize() async {
    await MobileAds.instance.initialize();
    await _instance._fetchConfig();
    await _instance._loadViewCount();
    debugPrint('🎬 AdMob initialized with config');
  }

  Future<void> _loadViewCount() async {
    final prefs = await SharedPreferences.getInstance();
    _detailViewCount = prefs.getInt('ad_detail_view_count') ?? 0;
  }

  Future<void> _saveViewCount() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setInt('ad_detail_view_count', _detailViewCount);
  }

  Future<void> _fetchConfig() async {
    try {
      final doc = await FirebaseFirestore.instance
          .collection('configurations')
          .doc('ads')
          .get();
      if (doc.exists && doc.data() != null) {
        _config = AdConfig.fromMap(doc.data()!);
        debugPrint('✅ Ad Config loaded: enableAds=${_config.enableAds}');
      }
    } catch (e) {
      debugPrint('❌ Failed to fetch ad config: $e');
    }
  }

  bool get enableAds => _config.enableAds;
  bool get showBannerHome => _config.enableAds && _config.showBannerHome;
  bool get showBannerDetail => _config.enableAds && _config.showBannerDetail;

  String get rewardedAdUnitId {
    if (defaultTargetPlatform == TargetPlatform.android) {
      return _config.androidRewardedId;
    } else if (defaultTargetPlatform == TargetPlatform.iOS) {
      return _config.iosRewardedId;
    }
    return _config.androidRewardedId;
  }

  String get interstitialAdUnitId {
    if (defaultTargetPlatform == TargetPlatform.android) {
      return _config.androidInterstitialId;
    } else if (defaultTargetPlatform == TargetPlatform.iOS) {
      return _config.iosInterstitialId;
    }
    return _config.androidInterstitialId;
  }

  String get bannerAdUnitId {
    if (defaultTargetPlatform == TargetPlatform.android) {
      return _config.androidBannerId;
    } else if (defaultTargetPlatform == TargetPlatform.iOS) {
      return _config.iosBannerId;
    }
    return _config.androidBannerId;
  }

  /// Load rewarded ad
  Future<void> loadRewardedAd() async {
    if (!_config.enableAds) return;
    if (_isAdLoading || _isAdReady) {
      return;
    }

    _isAdLoading = true;
    await RewardedAd.load(
      adUnitId: rewardedAdUnitId,
      request: const AdRequest(),
      rewardedAdLoadCallback: RewardedAdLoadCallback(
        onAdLoaded: (ad) {
          debugPrint('✅ Rewarded ad loaded');
          _rewardedAd = ad;
          _isAdReady = true;
          _isAdLoading = false;

          _rewardedAd!.fullScreenContentCallback = FullScreenContentCallback(
            onAdDismissedFullScreenContent: (ad) {
              ad.dispose();
              _isAdReady = false;
              _rewardedAd = null;
              loadRewardedAd();
            },
            onAdFailedToShowFullScreenContent: (ad, error) {
              ad.dispose();
              _isAdReady = false;
              _rewardedAd = null;
            },
          );
        },
        onAdFailedToLoad: (error) {
          debugPrint('❌ Rewarded ad failed to load: $error');
          _isAdLoading = false;
          _isAdReady = false;
        },
      ),
    );
  }

  /// Show rewarded ad
  Future<bool> showRewardedAd({
    required Function() onUserEarnedReward,
    Function()? onAdDismissed,
  }) async {
    if (!_config.enableAds) {
      // If ads disabled, grant reward immediately (optional strategy)
      // or preventing seeing it. Here we just return false
      return false;
    }

    if (!_isAdReady || _rewardedAd == null) {
      await loadRewardedAd();
      await Future.delayed(const Duration(seconds: 2));
      if (!_isAdReady || _rewardedAd == null) return false;
    }

    bool rewardEarned = false;
    await _rewardedAd!.show(
      onUserEarnedReward: (ad, reward) {
        rewardEarned = true;
        onUserEarnedReward();
      },
    );

    await Future.delayed(const Duration(milliseconds: 500));
    onAdDismissed?.call();
    return rewardEarned;
  }

  /// Load Interstitial Ad
  Future<void> loadInterstitialAd() async {
    if (!_config.enableAds) return;

    await InterstitialAd.load(
      adUnitId: interstitialAdUnitId,
      request: const AdRequest(),
      adLoadCallback: InterstitialAdLoadCallback(
        onAdLoaded: (ad) {
          _interstitialAd = ad;
          _interstitialAd!.fullScreenContentCallback =
              FullScreenContentCallback(
                onAdDismissedFullScreenContent: (ad) {
                  ad.dispose();
                  _interstitialAd = null;
                },
              );
        },
        onAdFailedToLoad: (error) {
          debugPrint('Interstitial failed to load: $error');
        },
      ),
    );
  }

  /// Show Interstitial if frequency met and user is NOT premium
  Future<void> showInterstitialIfEligible({bool isPremium = false}) async {
    // If ads disabled globally OR user is premium, don't show
    if (!_config.enableAds || !_config.showInterstitialOnDetail || isPremium) {
      return;
    }

    _detailViewCount++;
    _saveViewCount(); // Persist count

    // Check if threshold reached
    if (_detailViewCount > _config.interstitialFrequency) {
      if (_interstitialAd != null) {
        _interstitialAd!.show();
        // Do NOT reset counter to 0 here to enforce "every subsequent view"
        // _detailViewCount = 0;
      } else {
        // Ad not ready, load for next time
        await loadInterstitialAd();
      }
    } else if (_detailViewCount == _config.interstitialFrequency) {
      // Preload when reaching threshold so it's ready for next view (which will exceed threshold)
      if (_interstitialAd == null) {
        await loadInterstitialAd();
      }
    }
  }

  /// Force show interstitial immediately (e.g. for Community Chat)
  Future<void> showImmediateInterstitial() async {
    if (!_config.enableAds) return;

    if (_interstitialAd != null) {
      await _interstitialAd!.show();
      _interstitialAd = null;
      // Preload next one
      loadInterstitialAd();
    } else {
      // If not ready, try to load and show
      await InterstitialAd.load(
        adUnitId: interstitialAdUnitId,
        request: const AdRequest(),
        adLoadCallback: InterstitialAdLoadCallback(
          onAdLoaded: (ad) {
            ad.fullScreenContentCallback = FullScreenContentCallback(
              onAdDismissedFullScreenContent: (ad) {
                ad.dispose();
              },
            );
            ad.show();
          },
          onAdFailedToLoad: (error) {
            debugPrint('Immediate Interstitial failed to load: $error');
          },
        ),
      );
    }
  }

  void dispose() {
    _rewardedAd?.dispose();
    _interstitialAd?.dispose();
    _rewardedAd = null;
    _interstitialAd = null;
    _isAdReady = false;
  }
}
