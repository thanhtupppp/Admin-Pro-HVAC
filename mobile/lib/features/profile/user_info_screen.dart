import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:gap/gap.dart';
import 'package:intl/intl.dart';
import '../../core/constants/app_colors.dart';
import '../auth/providers/auth_provider.dart';

class UserInfoScreen extends ConsumerWidget {
  const UserInfoScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final authState = ref.watch(authProvider);
    final user = authState.user;
    final userData = authState.userData;

    final displayName =
        userData?['name'] ?? user?.displayName ?? 'Chưa cập nhật';
    final email = user?.email ?? userData?['email'] ?? 'Chưa cập nhật';
    final username = userData?['username'] ?? 'Không có';
    final createdAt = userData?['createdAt'];
    final lastLogin = userData?['lastLogin'];

    String formatDate(String? dateStr) {
      if (dateStr == null) return 'Không rõ';
      try {
        final date = DateTime.parse(dateStr);
        return DateFormat('dd/MM/yyyy HH:mm').format(date);
      } catch (e) {
        return dateStr;
      }
    }

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('Thông tin cá nhân'),
        backgroundColor: AppColors.background,
        elevation: 0,
        foregroundColor: AppColors.textPrimary,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          children: [
            _buildInfoItem('Họ và tên', displayName, Icons.person_outline),
            _buildInfoItem('Email', email, Icons.email_outlined),
            _buildInfoItem('Tên đăng nhập', username, Icons.alternate_email),
            _buildInfoItem(
              'Ngày tham gia',
              formatDate(createdAt),
              Icons.calendar_today_outlined,
            ),
            _buildInfoItem(
              'Đăng nhập lần cuối',
              formatDate(lastLogin),
              Icons.access_time,
            ),

            const Gap(20),
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: AppColors.primary.withValues(alpha: 0.1),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(
                  color: AppColors.primary.withValues(alpha: 0.3),
                ),
              ),
              child: const Row(
                children: [
                  Icon(Icons.info_outline, color: AppColors.primary),
                  Gap(12),
                  Expanded(
                    child: Text(
                      'Để thay đổi các thông tin này, vui lòng sử dụng tính năng Chỉnh sửa hồ sơ.',
                      style: TextStyle(
                        color: AppColors.textSecondary,
                        fontSize: 13,
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildInfoItem(String label, String value, IconData icon) {
    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: AppColors.textSecondary.withValues(alpha: 0.1),
        ),
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: AppColors.background,
              borderRadius: BorderRadius.circular(8),
            ),
            child: Icon(icon, color: AppColors.textPrimary, size: 20),
          ),
          const Gap(16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  label,
                  style: const TextStyle(
                    color: AppColors.textSecondary,
                    fontSize: 12,
                  ),
                ),
                const Gap(4),
                Text(
                  value,
                  style: const TextStyle(
                    color: AppColors.textPrimary,
                    fontWeight: FontWeight.w600,
                    fontSize: 15,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
