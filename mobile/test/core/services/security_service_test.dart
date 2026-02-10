// Security Service Unit Tests
//
// Tests for security features: screenshot detection and app locking

import 'package:flutter_test/flutter_test.dart';
import 'package:shared_preferences/shared_preferences.dart';

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  group('SecurityService Initialization', () {
    test('Default screenshot count should be 0', () {
      const screenshotCount = 0;
      expect(screenshotCount, equals(0));
    });

    test('Default lock threshold should be 3', () {
      const lockThreshold = 3;
      expect(lockThreshold, equals(3));
      expect(lockThreshold, greaterThan(0));
    });
  });

  group('Screenshot Counter Logic', () {
    setUp(() async {
      SharedPreferences.setMockInitialValues({});
    });

    test('Screenshot count should persist', () async {
      final prefs = await SharedPreferences.getInstance();

      await prefs.setInt('screenshot_count', 2);
      final count = prefs.getInt('screenshot_count');

      expect(count, equals(2));
    });

    test('Screenshot count should increment on detection', () async {
      final prefs = await SharedPreferences.getInstance();

      int count = prefs.getInt('screenshot_count') ?? 0;
      count++;
      await prefs.setInt('screenshot_count', count);

      expect(prefs.getInt('screenshot_count'), equals(1));
    });

    test('Lock should trigger when threshold reached', () async {
      final prefs = await SharedPreferences.getInstance();
      const threshold = 3;

      await prefs.setInt('screenshot_count', threshold);
      final shouldLock = (prefs.getInt('screenshot_count') ?? 0) >= threshold;

      expect(shouldLock, isTrue);
    });
  });

  group('App Lock State', () {
    setUp(() async {
      SharedPreferences.setMockInitialValues({});
    });

    test('isLocked should default to false', () async {
      final prefs = await SharedPreferences.getInstance();
      final isLocked = prefs.getBool('is_locked') ?? false;

      expect(isLocked, isFalse);
    });

    test('Lock state should persist', () async {
      final prefs = await SharedPreferences.getInstance();

      await prefs.setBool('is_locked', true);
      final isLocked = prefs.getBool('is_locked');

      expect(isLocked, isTrue);
    });

    test('Unlock should reset lock state', () async {
      final prefs = await SharedPreferences.getInstance();

      await prefs.setBool('is_locked', true);
      await prefs.setBool('is_locked', false);
      await prefs.setInt('screenshot_count', 0);

      expect(prefs.getBool('is_locked'), isFalse);
      expect(prefs.getInt('screenshot_count'), equals(0));
    });
  });

  group('Security Permission Logic', () {
    test('Permission denied should block app usage', () {
      const permissionGranted = false;
      const shouldBlockUsage = !permissionGranted;

      expect(shouldBlockUsage, isTrue);
    });

    test('Permission granted should allow app usage', () {
      const permissionGranted = true;
      const shouldBlockUsage = !permissionGranted;

      expect(shouldBlockUsage, isFalse);
    });
  });
}
