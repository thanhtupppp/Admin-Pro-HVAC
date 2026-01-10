import 'package:flutter/material.dart';
import 'package:google_mobile_ads/google_mobile_ads.dart';
import '../../core/services/ad_service.dart';

enum AdPlacement { home, detail }

class AdBannerWidget extends StatefulWidget {
  final AdPlacement placement;

  const AdBannerWidget({super.key, required this.placement});

  @override
  State<AdBannerWidget> createState() => _AdBannerWidgetState();
}

class _AdBannerWidgetState extends State<AdBannerWidget> {
  BannerAd? _bannerAd;
  bool _isAdLoaded = false;
  final AdService _adService = AdService();

  @override
  void initState() {
    super.initState();
    // Delay load to allow context to be ready (if using provider in future)
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _loadAd();
    });
  }

  // Helper to check premium status would require Consumer/Riverpod here
  // For now, we'll let AdService load it, but ideally we shouldn't even load it.
  // Converting this widget to ConsumerStatefulWidget is better.

  void _loadAd() {
    // Check global enable flag
    if (!_adService.enableAds) return;

    // Check placement-specific flag
    if (widget.placement == AdPlacement.home && !_adService.showBannerHome) {
      return;
    }
    if (widget.placement == AdPlacement.detail &&
        !_adService.showBannerDetail) {
      return;
    }

    final bannerAd = BannerAd(
      adUnitId: _adService.bannerAdUnitId,
      request: const AdRequest(),
      size: AdSize.banner,
      listener: BannerAdListener(
        onAdLoaded: (ad) {
          if (mounted) {
            setState(() {
              _bannerAd = ad as BannerAd;
              _isAdLoaded = true;
            });
          }
        },
        onAdFailedToLoad: (ad, error) {
          debugPrint('BannerAd failed to load: $error');
          ad.dispose();
        },
      ),
    );

    bannerAd.load();
  }

  @override
  void dispose() {
    _bannerAd?.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    if (!_isAdLoaded || _bannerAd == null) return const SizedBox.shrink();

    return SizedBox(
      width: _bannerAd!.size.width.toDouble(),
      height: _bannerAd!.size.height.toDouble(),
      child: AdWidget(ad: _bannerAd!),
    );
  }
}
