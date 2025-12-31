import 'package:flutter/material.dart';
import 'package:gap/gap.dart';
import '../../../../core/constants/app_colors.dart';

class CategoryFilter extends StatelessWidget {
  const CategoryFilter({super.key});

  @override
  Widget build(BuildContext context) {
    final categories = [
      {'icon': null, 'label': 'Tất cả', 'isActive': true},
      {'icon': Icons.ac_unit, 'label': 'Điều hòa', 'isActive': false},
      {'icon': Icons.kitchen, 'label': 'Tủ lạnh', 'isActive': false},
      {
        'icon': Icons.local_laundry_service,
        'label': 'Máy giặt',
        'isActive': false,
      },
      {'icon': Icons.mode_fan_off, 'label': 'Lò sưởi', 'isActive': false},
    ];

    return SizedBox(
      height: 36,
      child: ListView.separated(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.symmetric(horizontal: 16),
        itemCount: categories.length,
        separatorBuilder: (_, _) => const Gap(12),
        itemBuilder: (context, index) {
          final item = categories[index];
          final isActive = item['isActive'] as bool;

          return Container(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            decoration: BoxDecoration(
              color: isActive ? AppColors.primary : AppColors.surface,
              borderRadius: BorderRadius.circular(100),
              border: isActive
                  ? null
                  : Border.all(
                      color: AppColors.textSecondary.withValues(alpha: 0.1),
                    ),
              boxShadow: isActive
                  ? [
                      BoxShadow(
                        color: AppColors.primary.withValues(alpha: 0.3),
                        blurRadius: 8,
                        offset: const Offset(0, 2),
                      ),
                    ]
                  : null,
            ),
            child: Row(
              children: [
                if (item['icon'] != null) ...[
                  Icon(
                    item['icon'] as IconData,
                    size: 18,
                    color: isActive ? Colors.white : AppColors.textSecondary,
                  ),
                  const Gap(8),
                ],
                Text(
                  item['label'] as String,
                  style: TextStyle(
                    color: isActive ? Colors.white : AppColors.textPrimary,
                    fontSize: 14,
                    fontWeight: FontWeight.w500,
                  ),
                ),
              ],
            ),
          );
        },
      ),
    );
  }
}
