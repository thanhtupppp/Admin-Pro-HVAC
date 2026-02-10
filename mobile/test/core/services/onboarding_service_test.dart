// Unit tests for OnboardingService
// Tests first-time user detection and completion tracking

import 'package:flutter_test/flutter_test.dart';

import 'package:shared_preferences/shared_preferences.dart';
import 'package:admin_pro_mobile/core/services/onboarding_service.dart';

void main() {
  late OnboardingService onboardingService;

  setUp(() {
    // Reset SharedPreferences mock before each test
    SharedPreferences.setMockInitialValues({});
    onboardingService = OnboardingService();
  });

  group('OnboardingService', () {
    group('isFirstTime', () {
      test('should return true when app opened for first time', () async {
        SharedPreferences.setMockInitialValues({});

        final result = await onboardingService.isFirstTime();

        expect(result, true);
      });

      test('should return true when key does not exist', () async {
        SharedPreferences.setMockInitialValues({'other_key': 'value'});

        final result = await onboardingService.isFirstTime();

        expect(result, true);
      });

      test('should return false after onboarding completed', () async {
        SharedPreferences.setMockInitialValues({'is_first_time': false});

        final result = await onboardingService.isFirstTime();

        expect(result, false);
      });
    });

    group('completeOnboarding', () {
      test('should set is_first_time to false', () async {
        SharedPreferences.setMockInitialValues({});

        await onboardingService.completeOnboarding();

        final prefs = await SharedPreferences.getInstance();
        expect(prefs.getBool('is_first_time'), false);
      });

      test('should persist across service instances', () async {
        SharedPreferences.setMockInitialValues({});

        await onboardingService.completeOnboarding();

        // Create new instance
        final newService = OnboardingService();
        final result = await newService.isFirstTime();

        expect(result, false);
      });
    });

    group('reset', () {
      test('should remove is_first_time key', () async {
        SharedPreferences.setMockInitialValues({'is_first_time': false});

        await onboardingService.reset();

        final result = await onboardingService.isFirstTime();
        expect(result, true);
      });

      test('should not affect other keys', () async {
        SharedPreferences.setMockInitialValues({
          'is_first_time': false,
          'other_key': 'value',
        });

        await onboardingService.reset();

        final prefs = await SharedPreferences.getInstance();
        expect(prefs.getString('other_key'), 'value');
      });
    });
  });
}
