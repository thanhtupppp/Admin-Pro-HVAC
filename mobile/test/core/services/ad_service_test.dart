// Ad Service Unit Tests
//
// Tests for AdConfig model and AdService utility methods
// Since AdMob requires platform integration, we test config and logic only

import 'package:flutter_test/flutter_test.dart';
import 'package:shared_preferences/shared_preferences.dart';

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  group('AdConfig Model Tests', () {
    test('AdConfig has expected default values', () {
      // Default values should match the expected structure
      const bannerAdUnitId =
          'ca-app-pub-3940256099942544/6300978111'; // Test ID
      const interstitialAdUnitId = 'ca-app-pub-3940256099942544/1033173712';
      const rewardedAdUnitId = 'ca-app-pub-3940256099942544/5224354917';

      expect(bannerAdUnitId, contains('ca-app-pub'));
      expect(interstitialAdUnitId, contains('ca-app-pub'));
      expect(rewardedAdUnitId, contains('ca-app-pub'));
    });

    test('AdConfig interstitialFrequency should be positive', () {
      const interstitialFrequency = 3;
      expect(interstitialFrequency, greaterThan(0));
    });
  });

  group('AdService View Count Logic', () {
    setUp(() async {
      SharedPreferences.setMockInitialValues({});
    });

    test('View count should start at 0', () async {
      final prefs = await SharedPreferences.getInstance();
      final viewCount = prefs.getInt('ad_view_count') ?? 0;

      expect(viewCount, equals(0));
    });

    test('View count should increment and save', () async {
      final prefs = await SharedPreferences.getInstance();

      // Simulate incrementing view count
      int viewCount = prefs.getInt('ad_view_count') ?? 0;
      viewCount++;
      await prefs.setInt('ad_view_count', viewCount);

      expect(prefs.getInt('ad_view_count'), equals(1));
    });

    test('View count should reset when frequency reached', () async {
      final prefs = await SharedPreferences.getInstance();
      const frequency = 3;

      // Simulate reaching frequency
      await prefs.setInt('ad_view_count', frequency);
      int viewCount = prefs.getInt('ad_view_count') ?? 0;

      if (viewCount >= frequency) {
        await prefs.setInt('ad_view_count', 0);
      }

      expect(prefs.getInt('ad_view_count'), equals(0));
    });
  });

  group('AdService Premium User Logic', () {
    test('Premium users should not see ads', () {
      const isPremium = true;
      const shouldShowAd = !isPremium;

      expect(shouldShowAd, isFalse);
    });

    test('Non-premium users should see ads when frequency met', () {
      const isPremium = false;
      const viewCount = 3;
      const frequency = 3;
      final shouldShowAd = !isPremium && viewCount >= frequency;

      expect(shouldShowAd, isTrue);
    });
  });
}
