import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:gap/gap.dart';
import '../../core/constants/app_colors.dart';
import '../auth/providers/auth_provider.dart';
import 'providers/dashboard_provider.dart';
import 'widgets/dashboard_header.dart';
import 'package:go_router/go_router.dart';
import 'widgets/dashboard_search_bar.dart';
import 'widgets/quick_action_grid.dart';
import 'widgets/stats_card.dart';
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
        child: CustomScrollView(
          physics: const BouncingScrollPhysics(),
          slivers: [
            // 1. Header & Search & Stats
            SliverToBoxAdapter(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  DashboardHeader(photoUrl: photoUrl),
                  const Gap(24),
                  const Padding(
                    padding: EdgeInsets.symmetric(horizontal: 16),
                    child: DashboardSearchBar(),
                  ),
                  const Gap(24),
                  const QuickActionGrid(),
                  const Gap(24),
                  const DayStatsCard(),
                  const Gap(32),
                ],
              ),
            ),

            // 2. Recent Errors Header
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.symmetric(
                  horizontal: 16,
                  vertical: 8,
                ),
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
            ),

            // 3. Recent Errors List (Horizontal)
            SliverToBoxAdapter(
              child: SizedBox(
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
                            imageUrl: item.imageUrl ?? '',
                            images: item.images,
                            videos: item.videos,
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
            ),

            const SliverGap(32),

            // 4. Common Errors Header
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.symmetric(
                  horizontal: 16,
                  vertical: 8,
                ),
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
                    InkWell(
                      onTap: () => context.push('/search-lookup'),
                      child: Text(
                        'Xem tất cả',
                        style: TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.w500,
                          color: AppColors.primary,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),

            // 5. Common Errors List (Vertical)
            commonErrorsAsync.when(
              data: (errors) {
                if (errors.isEmpty) {
                  return const SliverToBoxAdapter(
                    child: Padding(
                      padding: EdgeInsets.all(16.0),
                      child: Center(
                        child: Text(
                          'Chưa có dữ liệu lỗi thường gặp',
                          style: TextStyle(color: AppColors.textSecondary),
                        ),
                      ),
                    ),
                  );
                }
                return SliverPadding(
                  padding: const EdgeInsets.symmetric(horizontal: 16),
                  sliver: SliverList(
                    delegate: SliverChildBuilderDelegate((context, index) {
                      final item = errors[index];
                      return Padding(
                        padding: const EdgeInsets.only(bottom: 12),
                        child: GestureDetector(
                          onTap: () =>
                              context.push('/home/error-detail', extra: item),
                          child: CommonErrorItem(
                            code: item.code,
                            title: item.title,
                            brand: item.brand,
                            desc: item.description ?? '',
                            color: _getColorForBrand(item.brand),
                          ),
                        ),
                      );
                    }, childCount: errors.length),
                  ),
                );
              },
              loading: () => const SliverToBoxAdapter(
                child: Center(
                  child: Padding(
                    padding: EdgeInsets.all(20),
                    child: CircularProgressIndicator(),
                  ),
                ),
              ),
              error: (err, stack) => SliverToBoxAdapter(
                child: Center(
                  child: Padding(
                    padding: EdgeInsets.all(20),
                    child: Text('Lỗi: $err'),
                  ),
                ),
              ),
            ),

            const SliverGap(80),
          ],
        ),
      ),
    );
  }
}
