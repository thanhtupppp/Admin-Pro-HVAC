import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:admin_pro_mobile/features/video/video_player_screen.dart';

// YoutubePlayerScaffold might use platform views or web views which don't work in headless tests easily.
// We will test the invalid URL state logic which is pure Flutter.

void main() {
  group('VideoPlayerScreen Tests', () {
    testWidgets('renders error for invalid URL', (WidgetTester tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: VideoPlayerScreen(videoUrl: '', title: 'Test Video'),
        ),
      );

      // Should show error UI because URL is empty
      expect(find.text('Lỗi Video'), findsOneWidget);
      expect(find.text('Video không khả dụng'), findsOneWidget);
    });

    testWidgets('renders player for valid URL', (WidgetTester tester) async {
      // Skipping platform view test in headless environment
      // expecting clean exit or partial render
    }, skip: true);
  });
}
