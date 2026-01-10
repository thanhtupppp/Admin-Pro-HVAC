import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/services.dart';
import 'package:permission_handler/permission_handler.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'dart:async';
import '../../core/constants/app_colors.dart';

class SecurityService with WidgetsBindingObserver {
  static final SecurityService _instance = SecurityService._internal();
  factory SecurityService() => _instance;

  SecurityService._internal() {
    WidgetsBinding.instance.addObserver(this);
  }

  // Native Channel
  static const MethodChannel _channel = MethodChannel('com.admin_pro/security');

  // Configuration
  final int _warningThreshold = 5; // Warn on 5th attempt
  final int _lockThreshold = 10; // Lock on 10th attempt
  int _screenshotCount = 0;
  bool _isLocking = false;
  bool _isCheckingPermission = false;
  bool _isSensitive = false; // Only count when sensitive

  late final GlobalKey<NavigatorState> _navigatorKey;

  void setNavigatorKey(GlobalKey<NavigatorState> key) {
    _navigatorKey = key;
  }

  void setSensitive(bool value) {
    _isSensitive = value;
    debugPrint('🛡️ SecurityService: Sensitive Mode = $value');
  }

  Future<void> initialize() async {
    debugPrint('🛡️ SecurityService: Initialize called');

    // Check local lock state first
    final prefs = await SharedPreferences.getInstance();
    final isLocallyLocked = prefs.getBool('is_security_locked') ?? false;

    if (isLocallyLocked) {
      _isLocking = true;
    }

    _channel.setMethodCallHandler(_handleMethod);
  }

  Future<bool> get isLocallyLocked async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getBool('is_security_locked') ?? false;
  }

  Future<void> unlockLocal() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool('is_security_locked', false);
    _isLocking = false;
    _screenshotCount = 0;
  }

  // Retry locking if needed
  Future<void> syncLockState() async {
    // If we are locally locked, enforce server lock
    final locked = await isLocallyLocked;
    if (locked) {
      await _lockAccount();
    }
  }

  void dispose() {
    WidgetsBinding.instance.removeObserver(this);
    setSensitive(false);
    stopListenScreenshot();
    _channel.setMethodCallHandler(null);
  }

  Future<dynamic> _handleMethod(MethodCall call) async {
    if (call.method == 'onScreenshot') {
      _onScreenshotDetected();
    }
    return null;
  }

  Future<void> startListenScreenshot() async {
    debugPrint('🛡️ SecurityService: Sending native initialize signal');
    try {
      await _channel.invokeMethod('initialize');
    } catch (e) {
      debugPrint('❌ Native connection failed: $e');
    }
  }

  Future<void> stopListenScreenshot() async {
    try {
      await _channel.invokeMethod('dispose');
    } catch (e) {
      debugPrint('❌ Native dispose failed: $e');
    }
  }

  // --- Strict Enforcement Logic ---

  Future<void> enforceSecurity(BuildContext context) async {
    if (_isCheckingPermission) return;
    _isCheckingPermission = true;

    // Initialize channel handler
    _channel.setMethodCallHandler(_handleMethod);

    bool hasPerm = await _hasPermissions();
    if (hasPerm) {
      await startListenScreenshot();
      _isCheckingPermission = false;
      return;
    }

    // Request permissions
    await _requestPermissions();

    if (await _hasPermissions()) {
      await startListenScreenshot();
    } else {
      if (context.mounted) {
        _showBlockingDialog(context);
      }
    }

    _isCheckingPermission = false;
  }

  Future<bool> _hasPermissions() async {
    var storage = await Permission.storage.status;
    var photos = await Permission.photos.status;
    return storage.isGranted || photos.isGranted;
  }

  Future<void> _requestPermissions() async {
    await [Permission.storage, Permission.photos].request();
  }

  void _showBlockingDialog(BuildContext context) {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (dialogContext) => PopScope(
        canPop: false,
        child: AlertDialog(
          title: const Row(
            children: [
              Icon(Icons.security, color: AppColors.error),
              SizedBox(width: 8),
              Text('Yêu cầu bảo mật'),
            ],
          ),
          content: const Text(
            'Để bảo vệ bản quyền tài liệu, ứng dụng bắt buộc phải có quyền truy cập "Ảnh/Video" để phát hiện hành vi chụp màn hình.\n\nVui lòng cấp quyền trong Cài Đặt để tiếp tục sử dụng.',
            style: TextStyle(fontSize: 15),
          ),
          actions: [
            TextButton(
              onPressed: () async {
                await openAppSettings();
              },
              child: const Text(
                'Mở Cài Đặt',
                style: TextStyle(fontWeight: FontWeight.bold),
              ),
            ),
            TextButton(
              onPressed: () async {
                if (await _hasPermissions()) {
                  await startListenScreenshot();
                  if (dialogContext.mounted) {
                    Navigator.of(dialogContext).pop();
                  }
                }
              },
              child: const Text('Tôi đã cấp quyền'),
            ),
          ],
        ),
      ),
    );
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    if (state == AppLifecycleState.resumed) {
      _checkPermissionOnResume();
    }
  }

  Future<void> _checkPermissionOnResume() async {
    if (await _hasPermissions()) {
      await startListenScreenshot();
    }
  }

  // --- Detection Logic ---

  Future<void> _onScreenshotDetected() async {
    if (_isLocking) return;
    if (!_isSensitive) {
      debugPrint('📸 Screenshot detected but ignored (Not Sensitive Mode)');
      return;
    }

    _screenshotCount++;
    debugPrint('📸 Screenshot detected! Count: $_screenshotCount');

    if (_screenshotCount >= _warningThreshold &&
        _screenshotCount < _lockThreshold) {
      _showWarningDialog();
    }

    if (_screenshotCount >= _lockThreshold) {
      await _lockAccount();
    }
  }

  void _showWarningDialog() {
    final nav = _navigatorKey.currentState;
    final ctx = nav?.context;

    if (ctx == null) return;

    showDialog(
      context: ctx,
      barrierDismissible: false,
      builder: (context) {
        return AlertDialog(
          title: const Row(
            children: [
              Icon(Icons.security, color: AppColors.error),
              SizedBox(width: 8),
              Text('Cảnh báo bảo mật'),
            ],
          ),
          content: Text(
            'Phát hiện chụp màn hình liên tục ($_screenshotCount/$_lockThreshold).\n'
            'Tài liệu này được bảo vệ bản quyền. Nếu tiếp tục vi phạm, tài khoản của bạn sẽ bị KHÓA vĩnh viễn.',
            style: const TextStyle(fontSize: 15),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.of(context).pop(),
              child: const Text(
                'Đã hiểu',
                style: TextStyle(fontWeight: FontWeight.bold),
              ),
            ),
          ],
        );
      },
    );
  }

  Future<void> _lockAccount() async {
    _isLocking = true;

    // 1. Lock Locally immediately
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setBool('is_security_locked', true);
      await prefs.setBool(
        'is_lock_synced',
        false,
      ); // Mark as unsynced initially
    } catch (e) {
      debugPrint('❌ Failed to save local lock: $e');
    }

    // 2. Lock on Server
    final user = FirebaseAuth.instance.currentUser;
    if (user != null) {
      try {
        debugPrint('🔒 LOCKING ACCOUNT for User: ${user.uid}');

        await FirebaseFirestore.instance
            .collection('users')
            .doc(user.uid)
            .update({
              'status': 'locked',
              'lockReason': 'Excessive screenshots ($_screenshotCount times)',
              'lockedAt': FieldValue.serverTimestamp(),
            });

        // If update succeeds, mark as synced
        final prefs = await SharedPreferences.getInstance();
        await prefs.setBool('is_lock_synced', true);

        await FirebaseFirestore.instance
            .collection('suspicious_activities')
            .add({
              'userId': user.uid,
              'userEmail': user.email,
              'type': 'auto_lock_screenshot',
              'count': _screenshotCount,
              'timestamp': FieldValue.serverTimestamp(),
              'platform': 'mobile',
            });
      } catch (e) {
        debugPrint('❌ Failed to lock account reference: $e');
      }
    }

    // 3. Navigate to Locked Screen using GoRouter
    final context = _navigatorKey.currentContext;
    if (context != null && context.mounted) {
      context.go('/locked');
    } else {
      debugPrint('❌ Could not navigate to /locked: Context not found');
    }
  }

  Future<bool> get isLockSynced async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getBool('is_lock_synced') ?? false;
  }
}
