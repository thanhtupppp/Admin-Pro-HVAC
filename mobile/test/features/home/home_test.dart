import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:admin_pro_mobile/features/home/home_screen.dart';

void main() {
  group('HomeScreen Tests', () {
    testWidgets('HomeScreen renders', (WidgetTester tester) async {
      await tester.pumpWidget(
        ProviderScope(child: MaterialApp(home: HomeScreen())),
      );
      // Basic smoke test.
      // If children crash, this will fail.
      expect(find.byType(HomeScreen), findsOneWidget);
    });
  });
}
