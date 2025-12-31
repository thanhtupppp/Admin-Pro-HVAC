import 'package:flutter/foundation.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:google_sign_in/google_sign_in.dart';

class AuthService {
  final FirebaseAuth _auth = FirebaseAuth.instance;
  final FirebaseFirestore _firestore = FirebaseFirestore.instance;

  /// Get current user
  User? get currentUser => _auth.currentUser;

  /// Stream of auth state changes
  Stream<User?> get authStateChanges => _auth.authStateChanges();

  /// Stream of user data from Firestore
  Stream<Map<String, dynamic>?> getUserDataStream(String uid) {
    return _firestore.collection('users').doc(uid).snapshots().map((snapshot) {
      return snapshot.data();
    });
  }

  /// Đăng nhập với email và password
  Future<AuthResult> signIn({
    required String email,
    required String password,
  }) async {
    try {
      // Sign in with Firebase Auth
      final credential = await _auth.signInWithEmailAndPassword(
        email: email,
        password: password,
      );

      // Check if user exists in Firestore
      final userDoc = await _firestore
          .collection('users')
          .where('email', isEqualTo: email)
          .limit(1)
          .get();

      if (userDoc.docs.isEmpty) {
        await _auth.signOut();
        return AuthResult(
          success: false,
          error: 'Tài khoản không có quyền truy cập hệ thống.',
        );
      }

      final userData = userDoc.docs.first.data();

      // Check if account is locked
      if (userData['status'] == 'locked') {
        await _auth.signOut();
        return AuthResult(
          success: false,
          error: 'Tài khoản đã bị khóa. Vui lòng liên hệ quản trị viên.',
        );
      }

      // Update last login time
      await _firestore.collection('users').doc(userDoc.docs.first.id).update({
        'lastLogin': DateTime.now().toIso8601String(),
      });

      return AuthResult(
        success: true,
        user: credential.user,
        userData: userData,
      );
    } on FirebaseAuthException catch (e) {
      String errorMessage = 'Đăng nhập thất bại. Vui lòng thử lại.';

      switch (e.code) {
        case 'user-not-found':
        case 'wrong-password':
        case 'invalid-credential':
          errorMessage = 'Email hoặc mật khẩu không đúng.';
          break;
        case 'invalid-email':
          errorMessage = 'Email không hợp lệ.';
          break;
        case 'too-many-requests':
          errorMessage = 'Quá nhiều lần thử. Vui lòng thử lại sau.';
          break;
        case 'network-request-failed':
          errorMessage = 'Lỗi kết nối. Vui lòng kiểm tra internet.';
          break;
      }

      return AuthResult(success: false, error: errorMessage);
    } catch (e) {
      return AuthResult(
        success: false,
        error: 'Đã xảy ra lỗi. Vui lòng thử lại.',
      );
    }
  }

  /// Đăng ký tài khoản mới
  Future<AuthResult> signUp({
    required String email,
    required String password,
    required String name,
  }) async {
    try {
      // Create user in Firebase Auth
      final credential = await _auth.createUserWithEmailAndPassword(
        email: email,
        password: password,
      );

      // Create user document in Firestore
      final username = email.split('@')[0]; // Extract username from email
      await _firestore.collection('users').doc(credential.user!.uid).set({
        'email': email,
        'name': name,
        'username': username,
        'role': 'user',
        'status': 'active',
        'createdAt': DateTime.now().toIso8601String(),
        'lastLogin': DateTime.now().toIso8601String(),
      });

      return AuthResult(success: true, user: credential.user);
    } on FirebaseAuthException catch (e) {
      String errorMessage = 'Đăng ký thất bại.';

      switch (e.code) {
        case 'email-already-in-use':
          errorMessage = 'Email đã được sử dụng.';
          break;
        case 'weak-password':
          errorMessage = 'Mật khẩu quá yếu. Tối thiểu 6 ký tự.';
          break;
        case 'invalid-email':
          errorMessage = 'Email không hợp lệ.';
          break;
      }

      return AuthResult(success: false, error: errorMessage);
    } catch (e) {
      return AuthResult(
        success: false,
        error: 'Đã xảy ra lỗi. Vui lòng thử lại.',
      );
    }
  }

  /// Đăng xuất
  Future<void> signOut() async {
    await GoogleSignIn().signOut();
    await _auth.signOut();
  }

  /// Reset password
  Future<AuthResult> resetPassword({required String email}) async {
    try {
      debugPrint('DEBUG: Sending password reset email to $email');
      await _auth.sendPasswordResetEmail(email: email);
      debugPrint('DEBUG: Password reset email sent successfully');
      return AuthResult(
        success: true,
        message: 'Email khôi phục mật khẩu đã được gửi.',
      );
    } on FirebaseAuthException catch (e) {
      debugPrint('DEBUG: FirebaseAuthException: ${e.code} - ${e.message}');
      String errorMessage = 'Gửi email thất bại.';

      switch (e.code) {
        case 'user-not-found':
          errorMessage = 'Email không tồn tại trong hệ thống.';
          break;
        case 'invalid-email':
          errorMessage = 'Email không hợp lệ.';
          break;
      }

      return AuthResult(success: false, error: errorMessage);
    } catch (e) {
      debugPrint('DEBUG: General Error: $e');
      return AuthResult(success: false, error: 'Đã xảy ra lỗi: $e');
    }
  }

  /// Đăng nhập với Google
  Future<AuthResult> signInWithGoogle() async {
    try {
      final GoogleSignInAccount? googleUser = await GoogleSignIn().signIn();

      if (googleUser == null) {
        return AuthResult(success: false, error: 'Đăng nhập Google đã bị hủy.');
      }

      final GoogleSignInAuthentication googleAuth =
          await googleUser.authentication;

      final credential = GoogleAuthProvider.credential(
        accessToken: googleAuth.accessToken,
        idToken: googleAuth.idToken,
      );

      final userCredential = await _auth.signInWithCredential(credential);
      final user = userCredential.user!;

      final userDoc = await _firestore.collection('users').doc(user.uid).get();

      if (userDoc.exists) {
        final userData = userDoc.data()!;

        if (userData['status'] == 'locked') {
          await _auth.signOut();
          return AuthResult(success: false, error: 'Tài khoản đã bị khóa.');
        }

        await _firestore.collection('users').doc(user.uid).update({
          'lastLogin': DateTime.now().toIso8601String(),
          'photoURL': user.photoURL,
        });

        return AuthResult(success: true, user: user, userData: userData);
      } else {
        final username = user.email?.split('@')[0] ?? 'user';
        final userData = {
          'email': user.email,
          'name': user.displayName ?? username,
          'username': username,
          'role': 'user',
          'status': 'active',
          'authProvider': 'google',
          'photoURL': user.photoURL,
          'createdAt': DateTime.now().toIso8601String(),
          'lastLogin': DateTime.now().toIso8601String(),
        };

        await _firestore.collection('users').doc(user.uid).set(userData);
        return AuthResult(success: true, user: user, userData: userData);
      }
    } catch (e) {
      debugPrint('Google Sign-In Error: $e'); // Log error for debugging
      return AuthResult(success: false, error: 'Đăng nhập Google thất bại: $e');
    }
  }

  /// Update user profile
  Future<AuthResult> updateProfile({
    required String name,
    String? photoURL,
  }) async {
    try {
      final user = _auth.currentUser;
      if (user == null) {
        return AuthResult(success: false, error: 'Người dùng chưa đăng nhập.');
      }

      // Update Firebase Auth
      await user.updateDisplayName(name);
      if (photoURL != null) {
        await user.updatePhotoURL(photoURL);
      }

      // Update Firestore
      final updateData = {'name': name};
      if (photoURL != null) updateData['photoURL'] = photoURL;

      await _firestore.collection('users').doc(user.uid).update(updateData);

      // Force refresh user to get updated data
      await user.reload();
      final updatedUser = _auth.currentUser;

      return AuthResult(success: true, user: updatedUser);
    } catch (e) {
      debugPrint('Update Profile Error: $e');
      return AuthResult(success: false, error: 'Cập nhật hồ sơ thất bại: $e');
    }
  }

  /// Downgrade to Free plan (on expiration)
  Future<AuthResult> downgradeToFreePlan(String uid) async {
    try {
      await _firestore.collection('users').doc(uid).update({
        'plan': 'Free',
        'planId': FieldValue.delete(),
        'planName': FieldValue.delete(),
        'planExpiresAt': FieldValue.delete(),
      });
      return AuthResult(success: true);
    } catch (e) {
      debugPrint('Downgrade Plan Error: $e');
      return AuthResult(success: false, error: e.toString());
    }
  }

  /// Change Password
  Future<AuthResult> changePassword({
    required String currentPassword,
    required String newPassword,
  }) async {
    try {
      final user = _auth.currentUser;
      if (user == null) {
        return AuthResult(success: false, error: 'Người dùng chưa đăng nhập.');
      }

      final email = user.email;
      if (email == null) {
        return AuthResult(success: false, error: 'Không tìm thấy email.');
      }

      // Re-authenticate
      final credential = EmailAuthProvider.credential(
        email: email,
        password: currentPassword,
      );

      await user.reauthenticateWithCredential(credential);

      // Update password
      await user.updatePassword(newPassword);

      return AuthResult(success: true, message: 'Đổi mật khẩu thành công.');
    } on FirebaseAuthException catch (e) {
      debugPrint('Change Password Error: ${e.code}');
      String errorMessage = 'Đổi mật khẩu thất bại.';
      if (e.code == 'wrong-password' || e.code == 'invalid-credential') {
        errorMessage = 'Mật khẩu hiện tại không đúng.';
      } else if (e.code == 'weak-password') {
        errorMessage = 'Mật khẩu mới quá yếu.';
      }
      return AuthResult(success: false, error: errorMessage);
    } catch (e) {
      return AuthResult(success: false, error: 'Lỗi: $e');
    }
  }
}

/// Authentication result model
class AuthResult {
  final bool success;
  final User? user;
  final Map<String, dynamic>? userData;
  final String? error;
  final String? message;

  AuthResult({
    required this.success,
    this.user,
    this.userData,
    this.error,
    this.message,
  });
}
