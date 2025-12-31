import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/constants/app_colors.dart';

class DashboardSearchBar extends StatelessWidget {
  const DashboardSearchBar({super.key});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () {
        context.go('/search-lookup');
      },
      child: Container(
        height: 50,
        decoration: BoxDecoration(
          color: AppColors.surface,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: AppColors.textSecondary.withValues(alpha: 0.1),
          ),
        ),
        child: Row(
          children: [
            const SizedBox(width: 12),
            const Icon(Icons.search, color: AppColors.textSecondary),
            const SizedBox(width: 12),
            Expanded(
              child: TextField(
                enabled:
                    false, // Disable typing here, navigate to search screen instead
                style: const TextStyle(color: AppColors.textPrimary),
                decoration: InputDecoration(
                  hintText: 'Tìm mã lỗi, model hoặc triệu chứng...',
                  hintStyle: TextStyle(
                    color: AppColors.textSecondary.withValues(alpha: 0.7),
                    fontSize: 14,
                  ),
                  border: InputBorder.none,
                  isDense: true,
                ),
              ),
            ),
            Container(
              height: 24,
              width: 1,
              color: AppColors.textSecondary.withValues(alpha: 0.2),
            ),
            IconButton(
              icon: const Icon(Icons.mic, color: AppColors.primary),
              onPressed: () {
                // Voice search functionality (Pending)
                context.go('/search-lookup');
              },
            ),
          ],
        ),
      ),
    );
  }
}
