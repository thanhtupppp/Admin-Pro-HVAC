import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:admin_pro_mobile/features/saved/saved_screen.dart';

// Mock riverpod providers if needed, or rely on empty state.
// SavedScreen likely watches a provider for list of saved items.
// We should check if it handles empty data gracefully or crashes.

void main() {
  group('SavedScreen Tests', () {
    testWidgets('SavedScreen renders title', (WidgetTester tester) async {
      // Ideally override provider to return empty list
      await tester.pumpWidget(
        const ProviderScope(child: MaterialApp(home: SavedScreen())),
      );

      // Expect title "Đã lưu" or similar
      expect(find.text('Đã lưu'), findsOneWidget);
    });
  });
}
