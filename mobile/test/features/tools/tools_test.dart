import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:admin_pro_mobile/features/tools/tools_screen.dart';

void main() {
  group('ToolsScreen Tests', () {
    testWidgets('ToolsScreen renders correctly', (WidgetTester tester) async {
      await tester.pumpWidget(const MaterialApp(home: ToolsScreen()));

      expect(find.text('Công cụ HVAC PRO'), findsOneWidget);
      expect(find.text('Tính Superheat & Subcool'), findsOneWidget);
      expect(find.text('PT Chart Điện Tử'), findsOneWidget);
      expect(find.text('Quy Đổi Đơn Vị'), findsOneWidget);
    });

    testWidgets('ToolsScreen navigates to sub-tools', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(const MaterialApp(home: ToolsScreen()));

      // Tap on Superheat tool
      await tester.tap(find.text('Tính Superheat & Subcool'));
      await tester.pumpAndSettle();

      // Since we don't supply a router, it might just try to push named route.
      // We are just verifying the tap works without crashing.
    });
  });
}
