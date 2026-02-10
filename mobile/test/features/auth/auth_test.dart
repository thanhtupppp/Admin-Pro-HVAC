import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:admin_pro_mobile/features/auth/login_screen.dart';
import 'package:admin_pro_mobile/features/auth/providers/auth_provider.dart';
import 'package:admin_pro_mobile/features/auth/widgets/custom_text_field.dart';

import '../../helpers/test_asset_bundle.dart';
import '../../helpers/mock_http_overrides.dart';
import 'dart:io';

class MockAuthNotifier extends AuthNotifier {
  @override
  AuthState build() {
    return AuthState();
  }

  @override
  Future<bool> signIn(String email, String password) async {
    if (email == 'test@test.com' && password == 'password') {
      state = state.copyWith(isLoading: false);
      return true;
    }
    state = state.copyWith(error: 'Login failed', isLoading: false);
    return false;
  }

  @override
  void clearError() {
    state = state.copyWith(error: null);
  }
}

void main() {
  setUpAll(() {
    HttpOverrides.global = MockHttpOverrides();
  });

  group('LoginScreen Tests', () {
    testWidgets('LoginScreen renders correctly', (WidgetTester tester) async {
      await tester.pumpWidget(
        ProviderScope(
          overrides: [authProvider.overrideWith(() => MockAuthNotifier())],
          child: MaterialApp(
            home: DefaultAssetBundle(
              bundle: TestAssetBundle(),
              child: const LoginScreen(),
            ),
          ),
        ),
      );

      expect(find.text('HVAC Pro Checker'), findsOneWidget);
      expect(find.text('Đăng nhập'), findsOneWidget);
      expect(find.byType(CustomTextField), findsNWidgets(2));
    });

    testWidgets('LoginScreen validates empty input', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(
        ProviderScope(
          overrides: [authProvider.overrideWith(() => MockAuthNotifier())],
          child: MaterialApp(
            home: DefaultAssetBundle(
              bundle: TestAssetBundle(),
              child: const LoginScreen(),
            ),
          ),
        ),
      );

      await tester.tap(find.text('Đăng nhập'));
      await tester.pump();

      expect(find.text('Vui lòng nhập đầy đủ thông tin'), findsOneWidget);
    });

    testWidgets('LoginScreen handles failure', (WidgetTester tester) async {
      await tester.pumpWidget(
        ProviderScope(
          overrides: [authProvider.overrideWith(() => MockAuthNotifier())],
          child: MaterialApp(
            home: DefaultAssetBundle(
              bundle: TestAssetBundle(),
              child: const LoginScreen(),
            ),
          ),
        ),
      );

      await tester.enterText(
        find.widgetWithText(CustomTextField, 'Số điện thoại hoặc Email'),
        'wrong@test.com',
      );
      await tester.enterText(
        find.widgetWithText(CustomTextField, 'Mật khẩu'),
        '123456',
      );

      await tester.tap(find.text('Đăng nhập'));
      await tester.pumpAndSettle();

      expect(find.text('Login failed'), findsOneWidget);
    });
  });
}
