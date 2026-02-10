import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:admin_pro_mobile/features/subscription/presentation/subscription_screen.dart';

void main() {
  group('SubscriptionScreen Tests', () {
    testWidgets('SubscriptionScreen renders', (WidgetTester tester) async {
      await tester.pumpWidget(
        const ProviderScope(child: MaterialApp(home: SubscriptionScreen())),
      );

      expect(find.byType(SubscriptionScreen), findsOneWidget);
    });
  });
}
