import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:admin_pro_mobile/features/history/history_screen.dart';

void main() {
  group('HistoryScreen Tests', () {
    testWidgets('HistoryScreen renders title', (WidgetTester tester) async {
      await tester.pumpWidget(
        const ProviderScope(child: MaterialApp(home: HistoryScreen())),
      );

      // Expect title
      expect(find.text('Lịch sử tra cứu'), findsOneWidget);
    });
  });
}
