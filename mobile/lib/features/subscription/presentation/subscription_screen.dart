import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:gap/gap.dart';
import 'package:go_router/go_router.dart';
import '../../../core/constants/app_colors.dart';
import '../data/plan_model.dart';
import '../data/plan_repository.dart';
import '../../auth/providers/auth_provider.dart';

class SubscriptionScreen extends ConsumerWidget {
  const SubscriptionScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final plansAsyncValue = ref.watch(plansProvider);
    final authState = ref.watch(authProvider);
    final userPlan = authState.userData?['plan']?.toString() ?? 'Free';

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.close, color: Colors.white),
          onPressed: () => context.pop(),
        ),
        title: const Text(
          'Nâng cấp tài khoản',
          style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
        ),
        centerTitle: true,
      ),
      body: plansAsyncValue.when(
        data: (plans) {
          if (plans.isEmpty) {
            return const Center(
              child: Text(
                "Chưa có gói dịch vụ nào.",
                style: TextStyle(color: Colors.white),
              ),
            );
          }
          return SingleChildScrollView(
            padding: const EdgeInsets.all(16),
            child: Column(
              children: [
                const Text(
                  'Chọn gói phù hợp với bạn',
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 22,
                    fontWeight: FontWeight.bold,
                  ),
                  textAlign: TextAlign.center,
                ),
                const Gap(8),
                const Text(
                  'Mở khóa toàn bộ tính năng cao cấp để \nlàm việc hiệu quả hơn.',
                  style: TextStyle(
                    color: AppColors.textSecondary,
                    fontSize: 14,
                    height: 1.5,
                  ),
                  textAlign: TextAlign.center,
                ),
                const Gap(32),

                // Plans List
                ListView.separated(
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  itemCount: plans.length,
                  separatorBuilder: (context, index) => const Gap(20),
                  itemBuilder: (context, index) {
                    final plan = plans[index];
                    final planTier = plan.tier.toLowerCase();
                    final userTier = userPlan.toLowerCase();
                    final currentPlanId = authState.userData?['planId']
                        ?.toString();

                    bool isCurrentPlan = false;

                    if (currentPlanId != null && currentPlanId.isNotEmpty) {
                      isCurrentPlan = plan.id == currentPlanId;
                    } else {
                      // Fallback to Tier matching if planId is missing in user data
                      isCurrentPlan = planTier == userTier;
                    }

                    return _buildPlanCard(
                      context,
                      plan,
                      isCurrentPlan,
                      authState,
                    );
                  },
                ),
                const Gap(40),
              ],
            ),
          );
        },
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (err, stack) => Center(
          child: Text('Lỗi: $err', style: const TextStyle(color: Colors.red)),
        ),
      ),
    );
  }

  Widget _buildPlanCard(
    BuildContext context,
    PlanModel plan,
    bool isCurrentPlan,
    AuthState authState,
  ) {
    // Highlight premium or popular plans
    final isPremium = plan.isPopular || plan.name.toLowerCase() == 'premium';
    final cardColor = isPremium ? const Color(0xFF1E293B) : AppColors.surface;
    final borderColor = isPremium ? AppColors.primary : Colors.transparent;

    return Container(
      decoration: BoxDecoration(
        color: cardColor,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: borderColor, width: isPremium ? 2 : 1),
        boxShadow: isPremium
            ? [
                BoxShadow(
                  color: AppColors.primary.withValues(alpha: 0.2),
                  blurRadius: 16,
                  offset: const Offset(0, 4),
                ),
              ]
            : [],
      ),
      child: Stack(
        clipBehavior: Clip.none,
        children: [
          Padding(
            padding: const EdgeInsets.all(24),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Header
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            plan.displayName,
                            style: const TextStyle(
                              color: Colors.white,
                              fontSize: 18,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          const Gap(4),
                          Text(
                            plan.description,
                            style: const TextStyle(
                              color: AppColors.textSecondary,
                              fontSize: 13,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
                const Gap(24),

                // Price
                Row(
                  crossAxisAlignment: CrossAxisAlignment.baseline,
                  textBaseline: TextBaseline.alphabetic,
                  children: [
                    Text(
                      plan.formattedPrice,
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 32,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    if (plan.price > 0)
                      Text(
                        ' /${plan.billingCycle == 'monthly'
                            ? 'tháng'
                            : plan.billingCycle == 'yearly'
                            ? 'năm'
                            : 'trọn đời'}',
                        style: const TextStyle(
                          color: AppColors.textSecondary,
                          fontSize: 14,
                        ),
                      ),
                  ],
                ),
                const Gap(24),
                const Divider(height: 1, color: Color(0xFF334155)),
                const Gap(24),

                // Features
                Column(
                  children: plan.features.map((feature) {
                    return Padding(
                      padding: const EdgeInsets.only(bottom: 12),
                      child: Row(
                        children: [
                          Icon(
                            feature.enabled ? Icons.check_circle : Icons.cancel,
                            color: feature.enabled
                                ? (isPremium ? AppColors.primary : Colors.green)
                                : Colors.grey,
                            size: 20,
                          ),
                          const Gap(12),
                          Expanded(
                            child: Text(
                              feature.label,
                              style: TextStyle(
                                color: feature.enabled
                                    ? Colors.white
                                    : Colors.grey,
                                fontSize: 14,
                                decoration: feature.enabled
                                    ? null
                                    : TextDecoration.lineThrough,
                              ),
                            ),
                          ),
                        ],
                      ),
                    );
                  }).toList(),
                ),
                const Gap(24),

                // Button
                SizedBox(
                  width: double.infinity,
                  height: 50,
                  child: ElevatedButton(
                    onPressed: isCurrentPlan
                        ? () {
                            ScaffoldMessenger.of(context).showSnackBar(
                              const SnackBar(
                                content: Text('Bạn đang sử dụng gói này.'),
                              ),
                            );
                          }
                        : () {
                            context.pushNamed('payment', extra: plan);
                          },
                    style: ElevatedButton.styleFrom(
                      backgroundColor: isCurrentPlan
                          ? Colors.white.withValues(alpha: 0.1)
                          : (isPremium
                                ? AppColors.primary
                                : Colors.white.withValues(alpha: 0.1)),
                      foregroundColor: Colors.white,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                      elevation: (isPremium && !isCurrentPlan) ? 4 : 0,
                    ),
                    child: Builder(
                      builder: (context) {
                        if (!isCurrentPlan) {
                          return const Text(
                            'Nâng cấp ngay',
                            style: TextStyle(
                              fontWeight: FontWeight.bold,
                              fontSize: 16,
                            ),
                          );
                        }

                        final expiresAtStr = authState
                            .userData?['planExpiresAt']
                            ?.toString();
                        String label = 'Đang sử dụng';

                        if (expiresAtStr != null) {
                          try {
                            final expiry = DateTime.parse(expiresAtStr);
                            final remains = expiry
                                .difference(DateTime.now())
                                .inDays;
                            if (remains >= 0) {
                              label += ' (Còn $remains ngày)';
                            } else {
                              label += ' (Hết hạn)';
                            }
                          } catch (e) {
                            debugPrint(
                              'Error parsing expiry in SubscriptionScreen: $e',
                            );
                          }
                        } else {
                          // Fallback for plans without expiration date
                          label += ' (Vĩnh viễn)';
                        }

                        return Text(
                          label,
                          style: const TextStyle(
                            fontWeight: FontWeight.bold,
                            fontSize: 14,
                          ),
                        );
                      },
                    ),
                  ),
                ),
              ],
            ),
          ),

          // Badge
          if (plan.badge != null)
            Positioned(
              top: -12,
              right: 24,
              child: Container(
                padding: const EdgeInsets.symmetric(
                  horizontal: 12,
                  vertical: 6,
                ),
                decoration: BoxDecoration(
                  color: plan.isPopular ? Colors.orange : Colors.grey,
                  borderRadius: BorderRadius.circular(20),
                  boxShadow: [
                    BoxShadow(
                      color: (plan.isPopular ? Colors.orange : Colors.grey)
                          .withValues(alpha: 0.4),
                      blurRadius: 8,
                      offset: const Offset(0, 2),
                    ),
                  ],
                ),
                child: Text(
                  plan.badge!.toUpperCase(),
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 10,
                    fontWeight: FontWeight.bold,
                    letterSpacing: 0.5,
                  ),
                ),
              ),
            ),
        ],
      ),
    );
  }
}
