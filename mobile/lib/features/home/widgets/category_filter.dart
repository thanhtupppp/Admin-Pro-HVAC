import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:gap/gap.dart';
import '../../../../core/constants/app_colors.dart';
import '../providers/dashboard_provider.dart';

class CategoryFilter extends ConsumerWidget {
  const CategoryFilter({super.key});

  IconData _getIconForBrand(String brandName) {
    final lowerName = brandName.toLowerCase();
    if (lowerName.contains('điều hòa') ||
        lowerName.contains('daikin') ||
        lowerName.contains('panasonic') ||
        lowerName.contains('carrier')) {
      return Icons.ac_unit;
    } else if (lowerName.contains('tủ lạnh') ||
        lowerName.contains('refrigerator')) {
      return Icons.kitchen;
    } else if (lowerName.contains('máy giặt') ||
        lowerName.contains('lg') ||
        lowerName.contains('samsung') ||
        lowerName.contains('toshiba')) {
      return Icons.local_laundry_service;
    } else if (lowerName.contains('lò sưởi') || lowerName.contains('heater')) {
      return Icons.mode_fan_off;
    }
    return Icons.devices_other;
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final brandsAsync = ref.watch(brandsProvider);
    final selectedBrand = ref.watch(selectedBrandProvider);

    return SizedBox(
      height: 36,
      child: brandsAsync.when(
        data: (brands) {
          // Tạo danh sách categories với "Tất cả" ở đầu
          final categories = [
            {'id': null, 'label': 'Tất cả', 'icon': null},
            ...brands.map(
              (brand) => {
                'id': brand.name,
                'label': brand.name,
                'icon': _getIconForBrand(brand.name),
              },
            ),
          ];

          return ListView.separated(
            scrollDirection: Axis.horizontal,
            padding: const EdgeInsets.symmetric(horizontal: 16),
            itemCount: categories.length,
            separatorBuilder: (_, _) => const Gap(12),
            itemBuilder: (context, index) {
              final item = categories[index];
              final brandId = item['id'] as String?;
              final isActive = selectedBrand == brandId;

              return GestureDetector(
                onTap: () {
                  ref.read(selectedBrandProvider.notifier).select(brandId);
                },
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 16),
                  decoration: BoxDecoration(
                    color: isActive ? AppColors.primary : AppColors.surface,
                    borderRadius: BorderRadius.circular(100),
                    border: isActive
                        ? null
                        : Border.all(
                            color: AppColors.textSecondary.withValues(
                              alpha: 0.1,
                            ),
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
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      if (item['icon'] != null) ...[
                        Icon(
                          item['icon'] as IconData,
                          size: 18,
                          color: isActive
                              ? Colors.white
                              : AppColors.textSecondary,
                        ),
                        const Gap(8),
                      ],
                      Text(
                        item['label'] as String,
                        style: TextStyle(
                          color: isActive
                              ? Colors.white
                              : AppColors.textPrimary,
                          fontSize: 14,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                    ],
                  ),
                ),
              );
            },
          );
        },
        loading: () => const Center(
          child: SizedBox(
            width: 20,
            height: 20,
            child: CircularProgressIndicator(strokeWidth: 2),
          ),
        ),
        error: (err, stack) => Center(
          child: Text(
            'Lỗi tải danh mục',
            style: TextStyle(color: AppColors.textSecondary, fontSize: 12),
          ),
        ),
      ),
    );
  }
}
