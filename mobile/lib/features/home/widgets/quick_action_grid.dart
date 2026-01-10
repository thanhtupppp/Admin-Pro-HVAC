import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/constants/app_colors.dart';
import '../providers/home_provider.dart';

class QuickActionGrid extends StatelessWidget {
  const QuickActionGrid({super.key});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: Row(
        children: [
          _buildActionItem(
            context,
            icon: Icons.qr_code_scanner_rounded,
            label: 'Quét Lỗi',
            color: Colors.blueAccent,
            onTap: () {
              HapticFeedback.lightImpact();
              // Navigate to scan
            },
          ),
          const SizedBox(width: 12),
          _buildActionItem(
            context,
            icon: Icons.search_rounded,
            label: 'Tra Cứu',
            color: Colors.orangeAccent,
            onTap: () {
              HapticFeedback.lightImpact();
              context.push('/search-lookup');
            },
          ),
          const SizedBox(width: 12),
          _buildActionItem(
            context,
            icon: Icons.forum_rounded,
            label: 'Cộng đồng',
            color: Colors.purpleAccent,
            onTap: () {
              HapticFeedback.lightImpact();
              context.push('/community-chat');
            },
          ),
          const SizedBox(width: 12),
          Consumer(
            builder: (context, ref, child) {
              return _buildActionItem(
                context,
                icon: Icons.bookmark_rounded,
                label: 'Đã Lưu',
                color: Colors.tealAccent,
                onTap: () {
                  HapticFeedback.lightImpact();
                  ref.read(homeTabIndexProvider.notifier).setIndex(2);
                },
              );
            },
          ),
        ],
      ),
    );
  }

  Widget _buildActionItem(
    BuildContext context, {
    required IconData icon,
    required String label,
    required Color color,
    required VoidCallback onTap,
  }) {
    return Expanded(
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: onTap,
          borderRadius: BorderRadius.circular(16),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(
                height: 56,
                decoration: BoxDecoration(
                  color: AppColors.surface,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(
                    color: AppColors.textSecondary.withValues(alpha: 0.1),
                  ),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withValues(alpha: 0.1),
                      blurRadius: 8,
                      offset: const Offset(0, 4),
                    ),
                  ],
                ),
                child: Center(child: Icon(icon, color: color, size: 26)),
              ),
              const SizedBox(height: 8),
              Text(
                label,
                style: const TextStyle(
                  color: AppColors.textSecondary,
                  fontSize: 12,
                  fontWeight: FontWeight.w500,
                ),
                textAlign: TextAlign.center,
              ),
            ],
          ),
        ),
      ),
    );
  }
}
