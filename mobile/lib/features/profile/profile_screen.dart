import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:gap/gap.dart';
import '../../core/constants/app_colors.dart';
import '../auth/providers/auth_provider.dart';

class ProfileScreen extends ConsumerWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final authState = ref.watch(authProvider);
    final user = authState.user;
    final userData = authState.userData;

    final displayName = user?.displayName ?? userData?['name'] ?? 'Người dùng';
    final email = user?.email ?? userData?['email'] ?? 'Chưa cập nhật email';
    final photoUrl = user?.photoURL ?? userData?['photoURL'];

    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(20),
          child: Column(
            children: [
              const Gap(10),
              // 1. Profile Header
              Center(
                child: Column(
                  children: [
                    Stack(
                      children: [
                        Container(
                          width: 100,
                          height: 100,
                          decoration: BoxDecoration(
                            shape: BoxShape.circle,
                            border: Border.all(
                              color: AppColors.surface,
                              width: 4,
                            ),
                            boxShadow: [
                              BoxShadow(
                                color: Colors.black.withValues(alpha: 0.1),
                                blurRadius: 10,
                                offset: const Offset(0, 5),
                              ),
                            ],
                            image: photoUrl != null
                                ? DecorationImage(
                                    image: NetworkImage(photoUrl),
                                    fit: BoxFit.cover,
                                  )
                                : null,
                            color: AppColors.surface,
                          ),
                          child: photoUrl == null
                              ? const Icon(
                                  Icons.person,
                                  size: 50,
                                  color: AppColors.textSecondary,
                                )
                              : null,
                        ),
                        Positioned(
                          bottom: 0,
                          right: 0,
                          child: Container(
                            padding: const EdgeInsets.all(6),
                            decoration: BoxDecoration(
                              color: AppColors.primary,
                              shape: BoxShape.circle,
                              border: Border.all(
                                color: AppColors.background,
                                width: 2,
                              ),
                            ),
                            child: const Icon(
                              Icons.camera_alt,
                              color: Colors.white,
                              size: 16,
                            ),
                          ),
                        ),
                      ],
                    ),
                    const Gap(16),
                    Text(
                      displayName,
                      style: const TextStyle(
                        fontSize: 22,
                        fontWeight: FontWeight.bold,
                        color: AppColors.textPrimary,
                      ),
                    ),
                    const Gap(4),
                    Text(
                      email,
                      style: const TextStyle(
                        fontSize: 14,
                        color: AppColors.textSecondary,
                      ),
                    ),
                    const Gap(12),
                    // Plan Badge
                    Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 12,
                        vertical: 6,
                      ),
                      decoration: BoxDecoration(
                        color: (userData?['plan'] == 'Premium')
                            ? AppColors.primary.withValues(alpha: 0.1)
                            : AppColors.surface,
                        borderRadius: BorderRadius.circular(20),
                        border: Border.all(
                          color: (userData?['plan'] == 'Premium')
                              ? AppColors.primary
                              : Colors.transparent,
                        ),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(
                            (userData?['plan'] == 'Premium')
                                ? Icons.diamond
                                : Icons.person_outline,
                            size: 14,
                            color: (userData?['plan'] == 'Premium')
                                ? AppColors.primary
                                : AppColors.textSecondary,
                          ),
                          const Gap(6),
                          Builder(
                            builder: (context) {
                              final expiresAtStr = userData?['planExpiresAt']
                                  ?.toString();
                              final planType =
                                  userData?['plan']?.toString() ?? 'Free';
                              final planName = userData?['planName']
                                  ?.toString();

                              String displayText =
                                  'Gói: ${planName ?? planType}';
                              bool isExpired = false;

                              if (planType != 'Free') {
                                if (expiresAtStr != null) {
                                  try {
                                    final expiry = DateTime.parse(expiresAtStr);
                                    final now = DateTime.now();
                                    final remains = expiry
                                        .difference(now)
                                        .inDays;

                                    if (remains < 0) {
                                      displayText += ' (Hết hạn)';
                                      isExpired = true;
                                    } else {
                                      displayText += ' (Còn $remains ngày)';
                                    }
                                  } catch (e) {
                                    debugPrint('Error parsing expiry: $e');
                                    displayText += ' (Lỗi định dạng)';
                                  }
                                } else {
                                  // No expiration date set for a non-free plan
                                  displayText += ' (Vĩnh viễn)';
                                }
                              }

                              return Text(
                                displayText,
                                style: TextStyle(
                                  fontSize: 12,
                                  fontWeight: FontWeight.bold,
                                  color: isExpired
                                      ? Colors.red
                                      : (planType == 'Premium'
                                            ? AppColors.primary
                                            : AppColors.textSecondary),
                                ),
                              );
                            },
                          ),
                        ],
                      ),
                    ),
                    const Gap(16),
                    ElevatedButton(
                      onPressed: () {
                        context.push('/settings/edit-profile');
                      },
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppColors.primary,
                        foregroundColor: Colors.white,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(20),
                        ),
                        padding: const EdgeInsets.symmetric(
                          horizontal: 24,
                          vertical: 10,
                        ),
                        elevation: 0,
                      ),
                      child: const Text('Chỉnh sửa hồ sơ'),
                    ),
                  ],
                ),
              ),

              const Gap(32),

              // 2. Menu Options
              _buildSectionTitle('Tài khoản'),
              _buildMenuItem(
                icon: Icons.person_outline,
                title: 'Thông tin cá nhân',
                onTap: () {
                  context.push('/settings/user-info');
                },
              ),
              _buildMenuItem(
                icon: Icons.diamond_outlined,
                title: 'Nâng cấp gói VIP',
                trailing: const Icon(
                  Icons.chevron_right,
                  color: AppColors.primary,
                ),
                onTap: () {
                  context.push('/settings/subscription');
                },
              ),
              _buildMenuItem(
                icon: Icons.history_edu_outlined,
                title: 'Lịch sử thanh toán',
                onTap: () {
                  context.push('/settings/transactions');
                },
              ),
              _buildMenuItem(
                icon: Icons.notifications_none,
                title: 'Thông báo',
                onTap: () {
                  context.push('/home/notifications');
                },
              ),
              _buildMenuItem(
                icon: Icons.lock_outline,
                title: 'Đổi mật khẩu',
                onTap: () {
                  context.push('/settings/change-password');
                },
              ),

              const Gap(24),
              _buildSectionTitle('Ứng dụng'),
              _buildMenuItem(
                icon: Icons.language,
                title: 'Ngôn ngữ',
                trailing: const Text(
                  'Tiếng Việt',
                  style: TextStyle(
                    color: AppColors.textSecondary,
                    fontSize: 13,
                  ),
                ),
                onTap: () {},
              ),
              _buildMenuItem(
                icon: Icons.dark_mode_outlined,
                title: 'Giao diện',
                trailing: const Text(
                  'Tối',
                  style: TextStyle(
                    color: AppColors.textSecondary,
                    fontSize: 13,
                  ),
                ),
                onTap: () {},
              ),
              _buildMenuItem(
                icon: Icons.help_outline,
                title: 'Trợ giúp & Phản hồi',
                onTap: () {},
              ),

              const Gap(32),

              // 3. Logout Button
              InkWell(
                onTap: () async {
                  await ref.read(authProvider.notifier).signOut();
                },
                borderRadius: BorderRadius.circular(12),
                child: Container(
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  width: double.infinity,
                  decoration: BoxDecoration(
                    color: AppColors.error.withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(
                      color: AppColors.error.withValues(alpha: 0.2),
                    ),
                  ),
                  child: const Center(
                    child: Text(
                      'Đăng xuất',
                      style: TextStyle(
                        color: AppColors.error,
                        fontWeight: FontWeight.w600,
                        fontSize: 16,
                      ),
                    ),
                  ),
                ),
              ),

              const Gap(20),
              const Center(
                child: Text(
                  'Phiên bản 1.0.0',
                  style: TextStyle(
                    color: AppColors.textSecondary,
                    fontSize: 12,
                  ),
                ),
              ),
              const Gap(80),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildSectionTitle(String title) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12, left: 4),
      child: Align(
        alignment: Alignment.centerLeft,
        child: Text(
          title,
          style: const TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.bold,
            color: AppColors.textPrimary,
          ),
        ),
      ),
    );
  }

  Widget _buildMenuItem({
    required IconData icon,
    required String title,
    required VoidCallback onTap,
    Widget? trailing,
  }) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: AppColors.textSecondary.withValues(alpha: 0.1),
        ),
      ),
      child: ListTile(
        onTap: onTap,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        leading: Container(
          padding: const EdgeInsets.all(8),
          decoration: BoxDecoration(
            color: AppColors.background,
            borderRadius: BorderRadius.circular(8),
          ),
          child: Icon(icon, color: AppColors.textPrimary, size: 20),
        ),
        title: Text(
          title,
          style: const TextStyle(
            color: AppColors.textPrimary,
            fontWeight: FontWeight.w500,
            fontSize: 15,
          ),
        ),
        trailing:
            trailing ??
            const Icon(
              Icons.chevron_right,
              color: AppColors.textSecondary,
              size: 20,
            ),
      ),
    );
  }
}
