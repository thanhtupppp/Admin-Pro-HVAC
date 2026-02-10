import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:admin_pro_mobile/features/notification/notification_screen.dart';

void main() {
  group('NotificationScreen Tests', () {
    testWidgets('NotificationScreen renders list of notifications', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(const MaterialApp(home: NotificationScreen()));

      expect(find.text('Thông báo'), findsOneWidget);
      // Check for dummy data presence
      expect(find.text('Cảnh báo hệ thống'), findsOneWidget);
      expect(find.text('Chào mừng thành viên mới'), findsOneWidget);
    });
  });
}
