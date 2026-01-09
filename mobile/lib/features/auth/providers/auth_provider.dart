import 'dart:async';
import 'package:flutter/foundation.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/services/auth_service.dart';
import '../../../core/services/notification_service.dart';

/// Auth state model
class AuthState {
  final User? user;
  final Map<String, dynamic>? userData;
  final bool isLoading;
  final String? error;

  AuthState({this.user, this.userData, this.isLoading = false, this.error});

  AuthState copyWith({
    User? user,
    Map<String, dynamic>? userData,
    bool? isLoading,
    String? error,
  }) {
    return AuthState(
      user: user ?? this.user,
      userData: userData ?? this.userData,
      isLoading: isLoading ?? this.isLoading,
      error: error,
    );
  }
}

/// Auth state notifier
class AuthNotifier extends Notifier<AuthState> {
  late final AuthService _authService;
  StreamSubscription<User?>? _authStateSubscription;
  StreamSubscription<Map<String, dynamic>?>? _userDataSubscription;

  @override
  AuthState build() {
    _authService = ref.read(authServiceProvider);

    // Listen to auth state changes
    _authStateSubscription = _authService.authStateChanges.listen((user) {
      if (user != null) {
        _startUserDataSubscription(user.uid);
      } else {
        _cancelUserDataSubscription();
      }
      state = state.copyWith(user: user);
    });

    // Cleanup when provider is disposed
    ref.onDispose(() {
      _authStateSubscription?.cancel();
      _cancelUserDataSubscription();
    });

    return AuthState();
  }

  bool _isCheckingExpiry = false;

  void _startUserDataSubscription(String uid) {
    _cancelUserDataSubscription();
    _userDataSubscription = _authService.getUserDataStream(uid).listen((
      userData,
    ) async {
      if (userData != null) {
        state = state.copyWith(userData: userData);

        // Auto-check for plan expiration
        final expiresAtStr = userData['planExpiresAt']?.toString();
        final plan = userData['plan']?.toString() ?? 'Free';

        if (expiresAtStr != null && plan != 'Free' && !_isCheckingExpiry) {
          debugPrint('Checking plan expiry: $plan, expiresAt: $expiresAtStr');
          try {
            final expiry = DateTime.parse(expiresAtStr);
            final now = DateTime.now();
            debugPrint(
              'Now: $now, Expiry: $expiry, IsAfter: ${now.isAfter(expiry)}',
            );
            if (now.isAfter(expiry)) {
              debugPrint('Plan expired! Downgrading to Free plan...');
              _isCheckingExpiry = true;
              await _authService.downgradeToFreePlan(uid);
              _isCheckingExpiry = false;
            }
          } catch (e) {
            _isCheckingExpiry = false;
            debugPrint('Error checking plan expiry: $e');
          }
        }
      }
    });
  }

  void _cancelUserDataSubscription() {
    _userDataSubscription?.cancel();
    _userDataSubscription = null;
  }

  /// Sign in
  Future<bool> signIn(String email, String password) async {
    state = state.copyWith(isLoading: true, error: null);

    final result = await _authService.signIn(email: email, password: password);

    if (result.success) {
      state = state.copyWith(
        user: result.user,
        userData: result.userData,
        isLoading: false,
      );

      // Save FCM token
      if (result.user != null) {
        NotificationService().getTokenAndSave(result.user!.uid);
      }

      return true;
    } else {
      state = state.copyWith(isLoading: false, error: result.error);
      return false;
    }
  }

  /// Sign up
  Future<bool> signUp(String email, String password, String name) async {
    state = state.copyWith(isLoading: true, error: null);

    final result = await _authService.signUp(
      email: email,
      password: password,
      name: name,
    );

    if (result.success) {
      state = state.copyWith(user: result.user, isLoading: false);

      // Save FCM token
      if (result.user != null) {
        NotificationService().getTokenAndSave(result.user!.uid);
      }

      return true;
    } else {
      state = state.copyWith(isLoading: false, error: result.error);
      return false;
    }
  }

  /// Sign out
  Future<void> signOut() async {
    state = state.copyWith(isLoading: true);

    // Clear FCM token
    if (state.user != null) {
      await NotificationService().clearToken(state.user!.uid);
    }

    await _authService.signOut();
    state = AuthState();
  }

  /// Reset password
  Future<String?> resetPassword(String email) async {
    state = state.copyWith(isLoading: true, error: null);

    final result = await _authService.resetPassword(email: email);

    state = state.copyWith(isLoading: false);

    if (result.success) {
      return result.message;
    } else {
      state = state.copyWith(error: result.error);
      return null;
    }
  }

  /// Clear error
  void clearError() {
    state = state.copyWith(error: null);
  }

  /// Sign in with Google
  Future<bool> signInWithGoogle() async {
    state = state.copyWith(isLoading: true, error: null);

    final result = await _authService.signInWithGoogle();

    if (result.success) {
      state = state.copyWith(
        user: result.user,
        userData: result.userData,
        isLoading: false,
      );

      // Save FCM token
      if (result.user != null) {
        NotificationService().getTokenAndSave(result.user!.uid);
      }

      return true;
    } else {
      state = state.copyWith(isLoading: false, error: result.error);
      return false;
    }
  }

  /// Update Profile
  Future<bool> updateProfile(String name, {String? phoneNumber}) async {
    state = state.copyWith(isLoading: true, error: null);

    final result = await _authService.updateProfile(
      name: name,
      phoneNumber: phoneNumber,
    );

    if (result.success) {
      // Update local userData
      final newUserData = Map<String, dynamic>.from(state.userData ?? {});
      newUserData['name'] = name;
      if (phoneNumber != null) {
        newUserData['phoneNumber'] = phoneNumber;
      }

      state = state.copyWith(
        user: result.user,
        userData: newUserData,
        isLoading: false,
      );
      return true;
    } else {
      state = state.copyWith(isLoading: false, error: result.error);
      return false;
    }
  }

  /// Change Password
  Future<bool> changePassword(
    String currentPassword,
    String newPassword,
  ) async {
    state = state.copyWith(isLoading: true, error: null);

    final result = await _authService.changePassword(
      currentPassword: currentPassword,
      newPassword: newPassword,
    );

    state = state.copyWith(isLoading: false);

    if (result.success) {
      return true;
    } else {
      state = state.copyWith(error: result.error);
      return false;
    }
  }
}

/// Provider for auth service
final authServiceProvider = Provider<AuthService>((ref) {
  return AuthService();
});

/// Provider for auth state
final authProvider = NotifierProvider<AuthNotifier, AuthState>(() {
  return AuthNotifier();
});
