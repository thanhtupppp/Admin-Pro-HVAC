import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import '../../../core/constants/app_colors.dart';
import '../../auth/providers/auth_provider.dart';

class LockedAccountScreen extends ConsumerStatefulWidget {
  const LockedAccountScreen({super.key});

  @override
  ConsumerState<LockedAccountScreen> createState() =>
      _LockedAccountScreenState();
}

class _LockedAccountScreenState extends ConsumerState<LockedAccountScreen> {
  final TextEditingController _appealController = TextEditingController();
  bool _isSubmitting = false;
  bool _hasAppealed = false;

  @override
  void dispose() {
    _appealController.dispose();
    super.dispose();
  }

  Future<void> _submitAppeal() async {
    final reason = _appealController.text.trim();
    if (reason.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Vui lòng nhập lý do khiếu nại')),
      );
      return;
    }

    setState(() => _isSubmitting = true);

    try {
      final user = FirebaseAuth.instance.currentUser;
      if (user != null) {
        await FirebaseFirestore.instance.collection('appeals').add({
          'userId': user.uid,
          'userEmail': user.email,
          'reason': reason,
          'status': 'pending',
          'createdAt': FieldValue.serverTimestamp(),
          'deviceInfo': 'mobile_app',
        });

        setState(() => _hasAppealed = true);

        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('Đã gửi khiếu nại thành công! Admin sẽ xem xét.'),
              backgroundColor: Colors.green,
            ),
          );
        }
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(SnackBar(content: Text('Lỗi: $e')));
      }
    } finally {
      if (mounted) {
        setState(() => _isSubmitting = false);
      }
    }
  }

  Future<void> _signOut() async {
    await ref.read(authProvider.notifier).signOut();
    // Router redirect will handle navigation to login
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: Center(
          child: SingleChildScrollView(
            child: Padding(
              padding: const EdgeInsets.all(24.0),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                mainAxisSize: MainAxisSize.min, // Use min size
                children: [
                  const Icon(
                    Icons.lock_outline_rounded,
                    size: 80,
                    color: AppColors.error,
                  ),
                  const SizedBox(height: 24),
                  const Text(
                    'TÀI KHOẢN ĐÃ BỊ KHÓA',
                    style: TextStyle(
                      fontSize: 24,
                      fontWeight: FontWeight.bold,
                      color: Colors.white,
                    ),
                    textAlign: TextAlign.center,
                  ),
                  const SizedBox(height: 16),
                  const Text(
                    'Hệ thống phát hiện hành vi vi phạm chính sách bảo mật (chụp màn hình quá giới hạn hoặc vi phạm khác).',
                    style: TextStyle(color: Colors.white70, fontSize: 16),
                    textAlign: TextAlign.center,
                  ),
                  const SizedBox(height: 40),

                  if (_hasAppealed)
                    Container(
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: Colors.green.withValues(alpha: 0.1),
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(
                          color: Colors.green.withValues(alpha: 0.3),
                        ),
                      ),
                      child: const Column(
                        children: [
                          Icon(
                            Icons.check_circle,
                            color: Colors.green,
                            size: 32,
                          ),
                          SizedBox(height: 8),
                          Text(
                            'Đã gửi khiếu nại',
                            style: TextStyle(
                              color: Colors.green,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          Text(
                            'Vui lòng chờ Admin phản hồi.',
                            style: TextStyle(
                              color: Colors.white60,
                              fontSize: 13,
                            ),
                            textAlign: TextAlign.center,
                          ),
                        ],
                      ),
                    )
                  else
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.stretch,
                      children: [
                        const Text(
                          'Nếu bạn cho rằng đây là nhầm lẫn, hãy gửi khiếu nại:',
                          style: TextStyle(
                            color: Colors.white,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        const SizedBox(height: 12),
                        TextField(
                          controller: _appealController,
                          style: const TextStyle(color: Colors.white),
                          maxLines: 3,
                          decoration: InputDecoration(
                            hintText:
                                'Nhập lý do (VD: Tôi vô tình chạm nhầm...)',
                            hintStyle: const TextStyle(color: Colors.white30),
                            filled: true,
                            fillColor: AppColors.surface,
                            border: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(12),
                              borderSide: BorderSide.none,
                            ),
                          ),
                        ),
                        const SizedBox(height: 16),
                        ElevatedButton(
                          onPressed: _isSubmitting ? null : _submitAppeal,
                          style: ElevatedButton.styleFrom(
                            backgroundColor: AppColors.primary,
                            foregroundColor: Colors.white,
                            padding: const EdgeInsets.symmetric(vertical: 16),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(12),
                            ),
                          ),
                          child: _isSubmitting
                              ? const SizedBox(
                                  height: 20,
                                  width: 20,
                                  child: CircularProgressIndicator(
                                    strokeWidth: 2,
                                    color: Colors.white,
                                  ),
                                )
                              : const Text('Gửi Khiếu Nại'),
                        ),
                      ],
                    ),

                  const SizedBox(height: 32), // Spacer fix
                  TextButton.icon(
                    onPressed: _signOut,
                    icon: const Icon(Icons.logout, color: Colors.red),
                    label: const Text(
                      'Đăng xuất',
                      style: TextStyle(color: Colors.red),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
