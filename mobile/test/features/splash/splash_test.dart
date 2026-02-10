import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:admin_pro_mobile/features/splash/welcome_screen.dart';
import 'package:admin_pro_mobile/features/splash/onboarding_screen.dart';
import '../../helpers/test_asset_bundle.dart';

void main() {
  group('Splash & Onboarding Tests', () {
    setUp(() {
      SharedPreferences.setMockInitialValues({});
    });

    // Helper to wrap widget with asset bundle
    Future<void> pumpWidgetWithImages(
      WidgetTester tester,
      Widget widget,
    ) async {
      await tester.pumpWidget(
        MaterialApp(
          home: DefaultAssetBundle(bundle: TestAssetBundle(), child: widget),
        ),
      );
    }

    testWidgets('WelcomeScreen renders correctly', (WidgetTester tester) async {
      await pumpWidgetWithImages(tester, const WelcomeScreen());
      // await tester.pumpAndSettle(); // Wait for images if needed, but they are mocked

      expect(find.text('TechCheck'), findsOneWidget);
      expect(find.text('Chuyên gia Bỏ túi'), findsOneWidget);
      expect(find.text('Bắt đầu'), findsOneWidget);
    });

    testWidgets('OnboardingScreen renders first step', (
      WidgetTester tester,
    ) async {
      await pumpWidgetWithImages(tester, const OnboardingScreen());

      expect(find.text('Giải mã lỗi tức thì'), findsOneWidget);
      expect(find.text('E4'), findsOneWidget);
    });

    testWidgets('OnboardingScreen navigates to next step', (
      WidgetTester tester,
    ) async {
      await pumpWidgetWithImages(tester, const OnboardingScreen());

      // Initial state
      expect(find.text('Giải mã lỗi tức thì'), findsOneWidget);

      // Tap Next
      await tester.tap(find.text('Tiếp theo'));
      await tester.pumpAndSettle();

      // Check second step
      expect(find.text('Sơ đồ mạch điện'), findsOneWidget);
    });
  });
}
