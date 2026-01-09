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
    // Update logic to verify any paid plan
    final plan = userData?['plan'];
    final isPremium = [
      'Basic',
      'Premium',
      'Enterprise',
      'Internal',
    ].contains(plan);

    return Scaffold(
      backgroundColor: AppColors.background,
      body: CustomScrollView(
        physics: const BouncingScrollPhysics(),
        slivers: [
          // 1. Pro Header
          SliverAppBar(
            backgroundColor: AppColors.background,
            expandedHeight: 280,
            floating: false,
            pinned: true,
            flexibleSpace: FlexibleSpaceBar(
              background: Container(
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    begin: Alignment.topCenter,
                    end: Alignment.bottomCenter,
                    colors: [
                      AppColors.primary.withValues(alpha: 0.2),
                      AppColors.background,
                    ],
                  ),
                ),
                child: SafeArea(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      _buildAvatar(photoUrl, isPremium),
                      const Gap(16),
                      Text(
                        displayName,
                        style: const TextStyle(
                          fontSize: 24,
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
                      _buildPremiumBadge(userDat: userData),
                    ],
                  ),
                ),
              ),
            ),
          ),

          // 2. Stats Section (Optional/Decorative for now)
          SliverToBoxAdapter(child: _buildStatsRow()),

          // 3. Settings Groups
          SliverPadding(
            padding: const EdgeInsets.all(20),
            sliver: SliverList(
              delegate: SliverChildListDelegate([
                _buildSectionLabel('TÀI KHOẢN'),
                _buildSettingsGroup([
                  _SettingsItem(
                    icon: Icons.person_outline_rounded,
                    title: 'Thông tin cá nhân',
                    color: Colors.blue,
                    onTap: () => context.push('/settings/user-info'),
                  ),
                  _SettingsItem(
                    icon: Icons.diamond_outlined,
                    title: 'Nâng cấp gói VIP',
                    color: Colors.purple,
                    trailing: const Icon(
                      Icons.chevron_right,
                      color: AppColors.primary,
                    ),
                    onTap: () => context.push('/settings/subscription'),
                  ),
                  _SettingsItem(
                    icon: Icons.history_edu_rounded,
                    title: 'Lịch sử thanh toán',
                    color: Colors.green,
                    onTap: () => context.push('/settings/transactions'),
                  ),
                ]),
                const Gap(24),
                _buildSectionLabel('ỨNG DỤNG'),
                _buildSettingsGroup([
                  _SettingsItem(
                    icon: Icons.notifications_outlined,
                    title: 'Thông báo',
                    color: Colors.orange,
                    onTap: () => context.push('/settings/notifications'),
                  ),
                  _SettingsItem(
                    icon: Icons.lock_outline_rounded,
                    title: 'Đổi mật khẩu',
                    color: Colors.redAccent,
                    onTap: () => context.push('/settings/change-password'),
                  ),
                  _SettingsItem(
                    icon: Icons.language_rounded,
                    title: 'Ngôn ngữ',
                    color: Colors.teal,
                    trailing: const Text(
                      'Tiếng Việt',
                      style: TextStyle(
                        color: AppColors.textSecondary,
                        fontSize: 13,
                      ),
                    ),
                    onTap: () {},
                  ),
                  _SettingsItem(
                    icon: Icons.dark_mode_outlined,
                    title: 'Giao diện',
                    color: Colors.indigo,
                    trailing: const Text(
                      'Tối',
                      style: TextStyle(
                        color: AppColors.textSecondary,
                        fontSize: 13,
                      ),
                    ),
                    onTap: () {},
                  ),
                ]),
                const Gap(24),
                _buildSectionLabel('KHÁC'),
                _buildSettingsGroup([
                  _SettingsItem(
                    icon: Icons.help_outline_rounded,
                    title: 'Trợ giúp & Phản hồi',
                    color: Colors.cyan,
                    onTap: () => context.push('/settings/support'),
                  ),
                  _SettingsItem(
                    icon: Icons.logout_rounded,
                    title: 'Đăng xuất',
                    color: Colors.grey,
                    onTap: () async {
                      await ref.read(authProvider.notifier).signOut();
                    },
                  ),
                ]),
                const Gap(40),
                const Center(
                  child: Text(
                    'Admin Pro HVAC v1.0.0',
                    style: TextStyle(
                      color: AppColors.textSecondary,
                      fontSize: 12,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                ),
                const Gap(100),
              ]),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildAvatar(String? photoUrl, bool isPremium) {
    return Stack(
      alignment: Alignment.center,
      children: [
        // Glow effect for premium
        if (isPremium)
          Container(
            width: 110,
            height: 110,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              boxShadow: [
                BoxShadow(
                  color: AppColors.primary.withValues(alpha: 0.5),
                  blurRadius: 20,
                  offset: const Offset(0, 5),
                ),
              ],
            ),
          ),
        Container(
          width: 100,
          height: 100,
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            border: Border.all(
              color: isPremium ? AppColors.primary : AppColors.surface,
              width: 3,
            ),
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
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: AppColors.surface,
              shape: BoxShape.circle,
              border: Border.all(color: AppColors.background, width: 2),
            ),
            child: const Icon(
              Icons.camera_alt_rounded,
              size: 14,
              color: AppColors.textPrimary,
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildPremiumBadge({required Map<String, dynamic>? userDat}) {
    // 1. Determine Plan Name
    // Firestore stores 'plan' as 'Basic', 'Premium', 'Enterprise', or 'Free'
    final String rawPlan = userDat?['plan'] ?? 'Free';
    // Removed unused planId variable

    // Mapping for display
    String displayName = 'Thành viên miễn phí';
    bool isPaidPlan = false;
    Color badgeColor = AppColors.textSecondary;
    IconData badgeIcon = Icons.person_outline_rounded;

    if (['Basic', 'Premium', 'Enterprise', 'Internal'].contains(rawPlan)) {
      isPaidPlan = true;
      displayName = 'Thành viên $rawPlan';

      // Custom styling per tier
      if (rawPlan == 'Enterprise') {
        displayName = 'Doanh nghiệp (Enterprise)';
        badgeColor = const Color(0xFF9C27B0); // Purple
        badgeIcon = Icons.stars_rounded;
      } else if (rawPlan == 'Premium') {
        displayName = 'Thành viên PRO';
        badgeColor = AppColors.primary;
        badgeIcon = Icons.verified_rounded;
      } else if (rawPlan == 'Basic') {
        displayName = 'Thành viên Cơ bản';
        badgeColor = Colors.blue;
        badgeIcon = Icons.check_circle_outline_rounded;
      } else {
        // Internal/Other
        badgeColor = Colors.orange;
        badgeIcon = Icons.shield_rounded;
      }
    } else {
      // Free or unknown
      isPaidPlan = false;
    }

    // 2. Format Expiry
    final expiresAt = userDat?['planExpiresAt'];
    String? formattedExpiry;

    if (expiresAt != null) {
      try {
        final date = DateTime.parse(expiresAt);
        // Helper to format dd/MM/yyyy
        formattedExpiry =
            "${date.day.toString().padLeft(2, '0')}/${date.month.toString().padLeft(2, '0')}/${date.year}";
      } catch (_) {}
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      decoration: BoxDecoration(
        color: isPaidPlan
            ? badgeColor.withValues(alpha: 0.15)
            : AppColors.surface,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(
          color: isPaidPlan
              ? badgeColor.withValues(alpha: 0.3)
              : Colors.white10,
        ),
      ),
      child: Column(
        children: [
          Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(
                badgeIcon,
                size: 16,
                color: isPaidPlan ? badgeColor : AppColors.textSecondary,
              ),
              const Gap(8),
              Text(
                displayName,
                style: TextStyle(
                  color: isPaidPlan ? badgeColor : AppColors.textSecondary,
                  fontWeight: FontWeight.bold,
                  fontSize: 13,
                ),
              ),
            ],
          ),
          if (isPaidPlan && formattedExpiry != null) ...[
            const Gap(4),
            Text(
              'Hết hạn: $formattedExpiry',
              style: TextStyle(
                color: AppColors.textSecondary.withValues(alpha: 0.8),
                fontSize: 11,
              ),
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildStatsRow() {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 20),
      child: Row(
        children: [
          Expanded(child: _buildStatItem('Mã đã lưu', '12', Icons.bookmark)),
          const Gap(12),
          Expanded(
            child: _buildStatItem('Đang chờ', '0', Icons.hourglass_empty),
          ),
          const Gap(12),
          Expanded(
            child: _buildStatItem('Tháng này', '24', Icons.calendar_today),
          ),
        ],
      ),
    );
  }

  Widget _buildStatItem(String label, String value, IconData icon) {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 16),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.white.withValues(alpha: 0.05)),
      ),
      child: Column(
        children: [
          Icon(icon, size: 20, color: AppColors.textSecondary),
          const Gap(8),
          Text(
            value,
            style: const TextStyle(
              color: AppColors.textPrimary,
              fontSize: 18,
              fontWeight: FontWeight.bold,
            ),
          ),
          const Gap(4),
          Text(
            label,
            style: TextStyle(
              color: AppColors.textSecondary.withValues(alpha: 0.7),
              fontSize: 11,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSectionLabel(String label) {
    return Padding(
      padding: const EdgeInsets.only(left: 12, bottom: 8),
      child: Text(
        label,
        style: TextStyle(
          color: AppColors.textSecondary.withValues(alpha: 0.7),
          fontSize: 12,
          fontWeight: FontWeight.bold,
          letterSpacing: 1.0,
        ),
      ),
    );
  }

  Widget _buildSettingsGroup(List<_SettingsItem> items) {
    return Container(
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: Colors.white.withValues(alpha: 0.05)),
      ),
      child: Column(
        children: items.asMap().entries.map((entry) {
          final index = entry.key;
          final item = entry.value;
          final isLast = index == items.length - 1;

          return Column(
            children: [
              _buildSettingsTile(item),
              if (!isLast)
                Divider(
                  height: 1,
                  indent: 60,
                  color: Colors.white.withValues(alpha: 0.05),
                ),
            ],
          );
        }).toList(),
      ),
    );
  }

  Widget _buildSettingsTile(_SettingsItem item) {
    return ListTile(
      onTap: item.onTap,
      contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
      leading: Container(
        padding: const EdgeInsets.all(8),
        decoration: BoxDecoration(
          color: item.color.withValues(alpha: 0.1),
          borderRadius: BorderRadius.circular(10),
        ),
        child: Icon(item.icon, color: item.color, size: 20),
      ),
      title: Text(
        item.title,
        style: const TextStyle(
          color: AppColors.textPrimary,
          fontSize: 15,
          fontWeight: FontWeight.w500,
        ),
      ),
      trailing:
          item.trailing ??
          const Icon(
            Icons.chevron_right_rounded,
            color: AppColors.textSecondary,
            size: 18,
          ),
    );
  }
}

class _SettingsItem {
  final IconData icon;
  final String title;
  final Color color;
  final VoidCallback onTap;
  final Widget? trailing;

  _SettingsItem({
    required this.icon,
    required this.title,
    required this.color,
    required this.onTap,
    this.trailing,
  });
}
