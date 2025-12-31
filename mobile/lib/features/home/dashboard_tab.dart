import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:gap/gap.dart';
import '../../core/constants/app_colors.dart';
import '../auth/providers/auth_provider.dart';
import 'providers/dashboard_provider.dart';
import 'widgets/dashboard_header.dart';
import 'package:go_router/go_router.dart';
import 'widgets/dashboard_search_bar.dart';
import 'widgets/category_filter.dart';
import 'widgets/recent_error_card.dart';
import 'widgets/common_error_item.dart';

class DashboardTab extends ConsumerStatefulWidget {
  const DashboardTab({super.key});

  @override
  ConsumerState<DashboardTab> createState() => _DashboardTabState();
}

class _DashboardTabState extends ConsumerState<DashboardTab> {
  @override
  void initState() {
    super.initState();
    // Seed Data (For Development purpose - creating initial data on Firestore)
    WidgetsBinding.instance.addPostFrameCallback((_) {
      ref.read(dashboardRepositoryProvider).seedData();
    });
  }

  Color _getColorForBrand(String brand) {
    switch (brand.toLowerCase()) {
      case 'carrier':
        return Colors.orange;
      case 'lg':
      case 'máy giặt lg':
        return Colors.blue;
      case 'gree':
      case 'điều hòa gree':
        return Colors.red;
      case 'samsung':
        return Colors.purple;
      case 'whirlpool':
        return Colors.teal;
      default:
        return AppColors.primary;
    }
  }

  @override
  Widget build(BuildContext context) {
    final user = ref.watch(authProvider).user;
    final photoUrl = user?.photoURL;

    final recentErrorsAsync = ref.watch(recentErrorsProvider);
    final commonErrorsAsync = ref.watch(commonErrorsProvider);

    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: SingleChildScrollView(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // 1. Header
              DashboardHeader(photoUrl: photoUrl),

              const Gap(24),

              // 2. Search Bar
              const Padding(
                padding: EdgeInsets.symmetric(horizontal: 16),
                child: DashboardSearchBar(),
              ),

              const Gap(24),

              // 3. Category Filter
              const CategoryFilter(),

              const Gap(24),

              // 4. Recent Errors Section
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  crossAxisAlignment: CrossAxisAlignment.end,
                  children: [
                    const Text(
                      'Lỗi gần đây',
                      style: TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                        color: AppColors.textPrimary,
                      ),
                    ),
                    Text(
                      'Xóa lịch sử',
                      style: TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.w500,
                        color: AppColors.primary,
                      ),
                    ),
                  ],
                ),
              ),
              const Gap(12),

              SizedBox(
                height: 220,
                child: recentErrorsAsync.when(
                  data: (errors) {
                    if (errors.isEmpty) {
                      return const Center(
                        child: Text(
                          'Chưa có dữ liệu lỗi gần đây',
                          style: TextStyle(color: AppColors.textSecondary),
                        ),
                      );
                    }
                    return ListView.separated(
                      scrollDirection: Axis.horizontal,
                      padding: const EdgeInsets.symmetric(horizontal: 16),
                      itemCount: errors.length,
                      separatorBuilder: (_, _) => const Gap(16),
                      itemBuilder: (context, index) {
                        final item = errors[index];
                        return GestureDetector(
                          onTap: () =>
                              context.push('/home/error-detail', extra: item),
                          child: RecentErrorCard(
                            code: item.code,
                            brand: item.brand,
                            title: item.title,
                            subtitle: item.model,
                            imageUrl:
                                item.imageUrl ??
                                'https://via.placeholder.com/300x200',
                          ),
                        );
                      },
                    );
                  },
                  loading: () =>
                      const Center(child: CircularProgressIndicator()),
                  error: (err, stack) => Center(child: Text('Lỗi: $err')),
                ),
              ),

              const Gap(24),

              // 5. Common Errors Section
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  crossAxisAlignment: CrossAxisAlignment.end,
                  children: [
                    const Text(
                      'Lỗi thường gặp',
                      style: TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                        color: AppColors.textPrimary,
                      ),
                    ),
                    Text(
                      'Xem tất cả',
                      style: TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.w500,
                        color: AppColors.primary,
                      ),
                    ),
                  ],
                ),
              ),
              const Gap(12),

              commonErrorsAsync.when(
                data: (errors) {
                  if (errors.isEmpty) {
                    return const Padding(
                      padding: EdgeInsets.all(16.0),
                      child: Text(
                        'Chưa có dữ liệu lỗi thường gặp',
                        style: TextStyle(color: AppColors.textSecondary),
                      ),
                    );
                  }
                  return ListView.separated(
                    shrinkWrap: true,
                    physics: const NeverScrollableScrollPhysics(),
                    padding: const EdgeInsets.symmetric(horizontal: 16),
                    itemCount: errors.length,
                    separatorBuilder: (_, _) => const Gap(12),
                    itemBuilder: (context, index) {
                      final item = errors[index];
                      return GestureDetector(
                        onTap: () =>
                            context.push('/home/error-detail', extra: item),
                        child: CommonErrorItem(
                          code: item.code,
                          title: item.title,
                          brand: item.brand,
                          desc: item.description ?? '',
                          color: _getColorForBrand(item.brand),
                        ),
                      );
                    },
                  );
                },
                loading: () => const Center(
                  child: Padding(
                    padding: EdgeInsets.all(20),
                    child: CircularProgressIndicator(),
                  ),
                ),
                error: (err, stack) => Center(
                  child: Padding(
                    padding: EdgeInsets.all(20),
                    child: Text('Lỗi: $err'),
                  ),
                ),
              ),

              const Gap(80), // Bottom padding
            ],
          ),
        ),
      ),
    );
  }
}
