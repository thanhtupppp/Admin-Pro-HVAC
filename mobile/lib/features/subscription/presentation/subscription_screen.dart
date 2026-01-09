import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:gap/gap.dart';
import 'package:go_router/go_router.dart';
import '../../../core/constants/app_colors.dart';
import '../data/plan_model.dart';
import '../data/plan_repository.dart';
import '../../auth/providers/auth_provider.dart';

class SubscriptionScreen extends ConsumerStatefulWidget {
  const SubscriptionScreen({super.key});

  @override
  ConsumerState<SubscriptionScreen> createState() => _SubscriptionScreenState();
}

class _SubscriptionScreenState extends ConsumerState<SubscriptionScreen> {
  final PlanRepository _planRepository = PlanRepository();
  List<PlanModel> _plans = [];
  bool _isLoading = true;
  String? _errorMessage;

  @override
  void initState() {
    super.initState();
    _fetchPlans();
  }

  Future<void> _fetchPlans() async {
    try {
      final fetchedPlans = await _planRepository.getAllPlans();
      setState(() {
        _plans = fetchedPlans;
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _errorMessage = 'Không thể tải gói dịch vụ';
        _isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final authState = ref.watch(authProvider);
    final userPlanId = authState.userData?['planId']?.toString();
    final userPlanName = authState.userData?['plan']?.toString() ?? 'Free';

    return Scaffold(
      backgroundColor: AppColors.background,
      body: Stack(
        children: [
          // Background Gradient decoration
          Positioned.fill(
            child: Container(
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment.topCenter,
                  end: Alignment.bottomCenter,
                  colors: [
                    AppColors.primary.withValues(alpha: 0.2),
                    AppColors.background,
                    AppColors.background,
                  ],
                  stops: const [0.0, 0.3, 1.0],
                ),
              ),
            ),
          ),

          SafeArea(
            child: Column(
              children: [
                // Custom AppBar
                Padding(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 16,
                    vertical: 8,
                  ),
                  child: Row(
                    children: [
                      IconButton(
                        onPressed: () => context.pop(),
                        icon: const Icon(Icons.close, color: Colors.white),
                        style: IconButton.styleFrom(
                          backgroundColor: Colors.white.withValues(alpha: 0.1),
                        ),
                      ),
                    ],
                  ),
                ),

                Expanded(
                  child: _isLoading
                      ? const Center(child: CircularProgressIndicator())
                      : _errorMessage != null
                      ? _buildErrorState(_errorMessage!)
                      : _plans.isEmpty
                      ? _buildEmptyState()
                      : SingleChildScrollView(
                          padding: const EdgeInsets.fromLTRB(20, 0, 20, 20),
                          child: Column(
                            children: [
                              const Text(
                                'Nâng cấp Premium',
                                style: TextStyle(
                                  fontSize: 28,
                                  fontWeight: FontWeight.bold,
                                  color: AppColors.textPrimary,
                                ),
                              ),
                              const Gap(8),
                              Text(
                                'Mở khóa toàn bộ tính năng,\nkhông giới hạn.',
                                textAlign: TextAlign.center,
                                style: TextStyle(
                                  fontSize: 16,
                                  color: AppColors.textSecondary.withValues(
                                    alpha: 0.8,
                                  ),
                                  height: 1.5,
                                ),
                              ),
                              const Gap(32),

                              ..._plans.map((plan) {
                                final isCurrent =
                                    plan.id == userPlanId ||
                                    (userPlanId == null &&
                                        plan.name == userPlanName) ||
                                    plan.tier ==
                                        userPlanName; // Check against tier as well (e.g. Enterprise)

                                return Padding(
                                  padding: const EdgeInsets.only(bottom: 24),
                                  child: _buildPlanCard(
                                    context,
                                    plan,
                                    isCurrent,
                                  ),
                                );
                              }),

                              const Gap(8),
                              Text(
                                'Bạn có thể hủy bất kỳ lúc nào',
                                style: TextStyle(
                                  fontSize: 13,
                                  color: AppColors.textSecondary.withValues(
                                    alpha: 0.6,
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildErrorState(String message) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(Icons.error_outline, color: Colors.red.shade400, size: 60),
          const Gap(16),
          Text(
            message,
            style: const TextStyle(color: AppColors.textPrimary, fontSize: 16),
          ),
          const Gap(24),
          ElevatedButton.icon(
            onPressed: _fetchPlans,
            icon: const Icon(Icons.refresh),
            label: const Text('Thử lại'),
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.primary,
              foregroundColor: Colors.white,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildEmptyState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            Icons.inbox_rounded,
            size: 64,
            color: AppColors.textSecondary.withValues(alpha: 0.3),
          ),
          const Gap(16),
          const Text(
            'Chưa có gói dịch vụ nào',
            style: TextStyle(color: AppColors.textSecondary),
          ),
        ],
      ),
    );
  }

  Widget _buildPlanCard(BuildContext context, PlanModel plan, bool isCurrent) {
    return Container(
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(
          color: plan.isPopular
              ? AppColors.primary
              : Colors.white.withValues(alpha: 0.1),
          width: plan.isPopular ? 2 : 1,
        ),
        boxShadow: plan.isPopular
            ? [
                BoxShadow(
                  color: AppColors.primary.withValues(alpha: 0.25),
                  blurRadius: 20,
                  offset: const Offset(0, 10),
                ),
              ]
            : [],
      ),
      child: Stack(
        clipBehavior: Clip.none,
        children: [
          if (plan.isPopular)
            Positioned(
              top: -12,
              left: 0,
              right: 0,
              child: Center(
                child: Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 16,
                    vertical: 6,
                  ),
                  decoration: BoxDecoration(
                    color: AppColors.primary,
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: const Text(
                    'PHỔ BIẾN NHẤT',
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 10,
                      fontWeight: FontWeight.bold,
                      letterSpacing: 1.2,
                    ),
                  ),
                ),
              ),
            ),

          Padding(
            padding: const EdgeInsets.all(24),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      plan.name,
                      style: const TextStyle(
                        fontSize: 20,
                        fontWeight: FontWeight.bold,
                        color: Colors.white,
                      ),
                    ),
                    if (plan.discount != null && plan.discount! > 0)
                      Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 8,
                          vertical: 4,
                        ),
                        decoration: BoxDecoration(
                          color: Colors.green.withValues(alpha: 0.2),
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Text(
                          '-${plan.discount!.toInt()}%',
                          style: const TextStyle(
                            color: Colors.green,
                            fontWeight: FontWeight.bold,
                            fontSize: 12,
                          ),
                        ),
                      ),
                  ],
                ),
                const Gap(4),
                Text(
                  plan.description.isNotEmpty
                      ? plan.description
                      : 'Gói dịch vụ cao cấp',
                  style: const TextStyle(
                    fontSize: 14,
                    color: AppColors.textSecondary,
                  ),
                ),
                const Gap(24),

                Row(
                  crossAxisAlignment: CrossAxisAlignment.end,
                  children: [
                    Text(
                      plan.formattedPrice,
                      style: const TextStyle(
                        fontSize: 32,
                        fontWeight: FontWeight.bold,
                        color: Colors.white,
                        height: 1,
                      ),
                    ),
                    const Gap(4),
                    Text(
                      '/${plan.billingCycle == 'yearly' ? 'năm' : 'tháng'}',
                      style: TextStyle(
                        fontSize: 14,
                        color: AppColors.textSecondary.withValues(alpha: 0.7),
                        fontWeight: FontWeight.w500,
                        height: 2,
                      ),
                    ),
                  ],
                ),
                const Gap(24),
                Divider(color: Colors.white.withValues(alpha: 0.1), height: 1),
                const Gap(24),

                // Limits Grid
                Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: AppColors.background,
                    borderRadius: BorderRadius.circular(16),
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      _buildLimitItem(
                        'Errors',
                        plan.limits.maxErrorCodes.toString(),
                      ),
                      Container(
                        width: 1,
                        height: 24,
                        color: Colors.white.withValues(alpha: 0.1),
                      ),
                      _buildLimitItem(
                        'AI quota',
                        plan.limits.aiQuota.toString(),
                      ),
                      Container(
                        width: 1,
                        height: 24,
                        color: Colors.white.withValues(alpha: 0.1),
                      ),
                      _buildLimitItem('Users', plan.limits.maxUsers.toString()),
                    ],
                  ),
                ),
                const Gap(24),

                // Features
                ...plan.features.map((feature) => _buildFeatureItem(feature)),

                const Gap(32),

                // Action Button
                SizedBox(
                  width: double.infinity,
                  height: 52,
                  child: ElevatedButton(
                    onPressed: isCurrent
                        ? null
                        : () => context.pushNamed('payment', extra: plan),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: isCurrent
                          ? Colors.white.withValues(alpha: 0.1)
                          : (plan.isPopular ? AppColors.primary : Colors.white),
                      foregroundColor: isCurrent
                          ? Colors.white.withValues(alpha: 0.3)
                          : (plan.isPopular
                                ? Colors.white
                                : AppColors.background),
                      elevation: 0,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(16),
                      ),
                    ),
                    child: Text(
                      isCurrent ? 'Đang sử dụng' : 'Đăng ký ngay',
                      style: const TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildLimitItem(String label, String value) {
    return Column(
      children: [
        Text(
          value,
          style: const TextStyle(
            color: Colors.white,
            fontWeight: FontWeight.bold,
            fontSize: 16,
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
    );
  }

  Widget _buildFeatureItem(String text) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(4),
            decoration: BoxDecoration(
              color: AppColors.primary.withValues(alpha: 0.1),
              shape: BoxShape.circle,
            ),
            child: const Icon(Icons.check, size: 12, color: AppColors.primary),
          ),
          const Gap(12),
          Expanded(
            child: Text(
              text,
              style: const TextStyle(
                color: AppColors.textSecondary,
                fontSize: 14,
              ),
            ),
          ),
        ],
      ),
    );
  }
}
