import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter/material.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:go_router/go_router.dart';
import 'package:admin_pro_mobile/features/home/models/error_code_model.dart';

class NotificationService {
  static final NotificationService _instance = NotificationService._internal();
  factory NotificationService() => _instance;
  NotificationService._internal();

  final FirebaseMessaging _messaging = FirebaseMessaging.instance;
  final FlutterLocalNotificationsPlugin _localNotifications =
      FlutterLocalNotificationsPlugin();

  bool _initialized = false;
  GlobalKey<NavigatorState>? _navigatorKey;

  /// Set navigator key for navigation
  void setNavigatorKey(GlobalKey<NavigatorState> key) {
    _navigatorKey = key;
  }

  /// Initialize FCM and request permissions
  Future<void> initialize() async {
    if (_initialized) {
      return;
    }

    // Request permission (iOS automatically prompts, Android auto-grants)
    NotificationSettings settings = await _messaging.requestPermission(
      alert: true,
      badge: true,
      sound: true,
      provisional: false,
    );

    if (settings.authorizationStatus == AuthorizationStatus.authorized) {
      debugPrint('✅ User granted notification permission');
    } else if (settings.authorizationStatus ==
        AuthorizationStatus.provisional) {
      debugPrint('⚠️ User granted provisional permission');
    } else {
      debugPrint('❌ User denied notification permission');
      return;
    }

    // Initialize local notifications (for foreground display)
    const AndroidInitializationSettings androidSettings =
        AndroidInitializationSettings('@mipmap/ic_launcher');

    const DarwinInitializationSettings iosSettings =
        DarwinInitializationSettings(
          requestAlertPermission: true,
          requestBadgePermission: true,
          requestSoundPermission: true,
        );

    const InitializationSettings initSettings = InitializationSettings(
      android: androidSettings,
      iOS: iosSettings,
    );

    await _localNotifications.initialize(
      initSettings,
      onDidReceiveNotificationResponse: _onNotificationTap,
    );

    // Setup FCM handlers
    FirebaseMessaging.onMessage.listen(_handleForegroundMessage);
    FirebaseMessaging.onMessageOpenedApp.listen(_handleBackgroundTap);

    _initialized = true;
  }

  /// Get FCM token and save to Firestore
  Future<String?> getTokenAndSave(String userId) async {
    try {
      final token = await _messaging.getToken();
      if (token != null) {
        debugPrint('📱 FCM Token: $token');

        // Save to Firestore
        await FirebaseFirestore.instance.collection('users').doc(userId).update(
          {'fcmToken': token},
        );

        debugPrint('✅ Token saved to Firestore');
      }
      return token;
    } catch (e) {
      debugPrint('❌ Failed to get/save FCM token: $e');
      return null;
    }
  }

  /// Clear FCM token from Firestore (on logout)
  Future<void> clearToken(String userId) async {
    try {
      await FirebaseFirestore.instance.collection('users').doc(userId).update({
        'fcmToken': FieldValue.delete(),
      });
      debugPrint('✅ FCM Token cleared');
    } catch (e) {
      debugPrint('❌ Failed to clear FCM token: $e');
    }
  }

  /// Handle foreground messages (app is open)
  void _handleForegroundMessage(RemoteMessage message) {
    debugPrint('📨 Foreground message received');
    debugPrint('Title: ${message.notification?.title}');
    debugPrint('Body: ${message.notification?.body}');

    // Show local notification
    _showLocalNotification(message);
  }

  /// Show local notification
  Future<void> _showLocalNotification(RemoteMessage message) async {
    const AndroidNotificationDetails androidDetails =
        AndroidNotificationDetails(
          'default_channel',
          'Default Notifications',
          channelDescription: 'Notifications from Admin',
          importance: Importance.high,
          priority: Priority.high,
          showWhen: true,
        );

    const DarwinNotificationDetails iosDetails = DarwinNotificationDetails(
      presentAlert: true,
      presentBadge: true,
      presentSound: true,
    );

    const NotificationDetails details = NotificationDetails(
      android: androidDetails,
      iOS: iosDetails,
    );

    await _localNotifications.show(
      message.hashCode,
      message.notification?.title ?? 'New Notification',
      message.notification?.body ?? '',
      details,
      payload: message.data.toString(),
    );
  }

  /// Handle notification tap (background or terminated)
  void _handleBackgroundTap(RemoteMessage message) {
    debugPrint('🔔 Background notification tapped');
    debugPrint('Data: ${message.data}');

    // Navigate based on notification data
    _navigateFromNotification(message.data);
  }

  /// Handle notification tap (foreground)
  void _onNotificationTap(NotificationResponse response) {
    debugPrint('🔔 Foreground notification tapped');
    debugPrint('Payload: ${response.payload}');

    // Parse payload (if exists) and navigate
    if (response.payload != null && response.payload!.isNotEmpty) {
      // Payload is a string representation of the data map
      // For simplicity, we'll navigate to notifications screen
      _navigateToNotificationsScreen();
    }
  }

  /// Navigate based on notification data
  void _navigateFromNotification(Map<String, dynamic> data) {
    if (_navigatorKey?.currentContext == null) {
      debugPrint('⚠️ Navigator context is null, cannot navigate');
      return;
    }

    // Check notification type from data
    final type = data['type'] as String?;
    final id = data['id'] as String?;

    switch (type) {
      case 'error':
        // Navigate to error detail screen
        if (id != null) {
          debugPrint('📍 Navigating to error detail: $id');
          _navigateToErrorDetail(id);
        }
        break;

      case 'notification':
      default:
        // Navigate to notifications screen
        _navigateToNotificationsScreen();
        break;
    }
  }

  /// Navigate to error detail screen
  Future<void> _navigateToErrorDetail(String errorId) async {
    if (_navigatorKey?.currentContext == null) return;

    try {
      debugPrint('🔍 Fetching error: $errorId');

      // Fetch error from Firestore
      final doc = await FirebaseFirestore.instance
          .collection('errors')
          .doc(errorId)
          .get();

      if (!doc.exists) {
        debugPrint('❌ Error not found: $errorId');
        return;
      }

      // Convert to ErrorCode object using fromMap
      final errorData = doc.data()!;
      final errorCode = ErrorCode.fromMap(errorData, doc.id);

      debugPrint('✅ Error fetched, navigating...');

      // Check if context is still valid after async operation
      if (_navigatorKey?.currentContext == null) {
        debugPrint('⚠️ Context no longer available after fetch');
        return;
      }

      final context = _navigatorKey!.currentContext!;

      // Navigate using GoRouter with ErrorCode object
      // ignore: use_build_context_synchronously
      context.push('/home/error-detail', extra: errorCode);
    } catch (e) {
      debugPrint('❌ Failed to navigate to error detail: $e');
    }
  }

  /// Navigate to notifications screen
  void _navigateToNotificationsScreen() {
    if (_navigatorKey?.currentContext == null) return;

    final context = _navigatorKey!.currentContext!;
    debugPrint('📍 Navigating to notifications screen');

    // Navigate to settings/notifications using GoRouter
    try {
      context.go('/settings/notifications');
    } catch (e) {
      debugPrint('❌ Navigation error: $e');
    }
  }
}
