import 'dart:async';
import 'package:flutter/material.dart';
import 'package:gap/gap.dart';
import 'package:go_router/go_router.dart';
import 'package:firebase_auth/firebase_auth.dart';
import '../../core/constants/app_colors.dart';
import '../home/models/error_code_model.dart';
import 'search_repository.dart';
import 'search_history_repository.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../home/providers/dashboard_provider.dart';
import '../subscription/services/quota_service.dart';
import '../subscription/services/permissions_service.dart';
import '../subscription/data/plan_model.dart';
import '../subscription/data/plan_repository.dart';
import '../subscription/data/user_quota_model.dart';
import '../../shared/widgets/quota_indicator.dart';
import '../../core/services/ad_service.dart';

class SearchScreen extends ConsumerStatefulWidget {
  const SearchScreen({super.key});

  @override
  ConsumerState<SearchScreen> createState() => _SearchScreenState();
}

class _SearchScreenState extends ConsumerState<SearchScreen> {
  final TextEditingController _searchController = TextEditingController();
  final SearchRepository _repository = SearchRepository();
  final SearchHistoryRepository _historyRepository = SearchHistoryRepository();

  List<String> _history = [];
  List<ErrorCode> _results = [];
  bool _isLoading = false;
  Timer? _debounce;
  String _selectedBrand = '';
  String _selectedCategory = '';

  // Quota & Permissions
  QuotaService? _quotaService;
  PermissionsService? _permissionsService;
  PlanModel? _userPlan;
  bool _isInitializing = true;

  @override
  void initState() {
    super.initState();
    _initializeQuotaServices();
    _loadHistory();
    // Load initial suggestions (e.g., popular or recent)
    _performSearch('');
  }

  Future<void> _initializeQuotaServices() async {
    final user = FirebaseAuth.instance.currentUser;
    if (user == null) {
      setState(() => _isInitializing = false);
      return;
    }

    final planRepo = PlanRepository();
    final plan = await planRepo.getUserPlan(user.uid);

    if (plan != null) {
      setState(() {
        _userPlan = plan;
        _quotaService = QuotaService(
          userId: user.uid,
          dailyLimit: plan.quotas.dailyErrorSearchLimit ?? 999999,
        );
        _permissionsService = PermissionsService(plan);
        _isInitializing = false;
      });

      // Preload ad for Free users
      if (plan.isFree) {
        AdService().loadRewardedAd();
      }
    } else {
      setState(() => _isInitializing = false);
    }
  }

  Future<void> _loadHistory() async {
    final history = await _historyRepository.getHistory();
    if (mounted) {
      setState(() => _history = history);
    }
  }

  Future<void> _deleteHistoryItem(String query) async {
    // Optimistic UI update for Dismissible
    setState(() {
      _history = List.from(_history)..remove(query);
    });

    // Sync with storage
    await _historyRepository.removeQuery(query);
    // No need to reload history as we already updated UI
  }

  Future<void> _clearHistory() async {
    final shouldClear = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Xóa lịch sử?'),
        content: const Text(
          'Bạn có chắc chắn muốn xóa toàn bộ lịch sử tìm kiếm không?',
        ),
        actions: [
          TextButton(
            onPressed: () => context.pop(false),
            child: const Text(
              'Hủy',
              style: TextStyle(color: AppColors.textSecondary),
            ),
          ),
          TextButton(
            onPressed: () => context.pop(true),
            child: const Text('Xóa', style: TextStyle(color: Colors.red)),
          ),
        ],
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        backgroundColor: AppColors.surface,
      ),
    );

    if (shouldClear == true) {
      await _historyRepository.clearHistory();
      _loadHistory();
    }
  }

  @override
  void dispose() {
    _debounce?.cancel();
    _searchController.dispose();
    super.dispose();
  }

  void _onSearchChanged(String query) {
    if (_debounce?.isActive ?? false) _debounce!.cancel();
    _debounce = Timer(const Duration(milliseconds: 500), () {
      _performSearch(query);
    });
  }

  Future<void> _performSearch(String query) async {
    // Check quota BEFORE searching (for non-empty queries)
    if (query.isNotEmpty &&
        _quotaService != null &&
        _permissionsService != null) {
      final canSearch = await _permissionsService!.canPerformErrorSearch(
        _quotaService!,
      );

      if (!canSearch) {
        // Show quota exhausted dialog
        if (mounted) {
          final quota = await _quotaService!.getTodayQuota();
          _showQuotaExhaustedDialog(quota);
        }
        return; // Don't perform search
      }
    }

    setState(() => _isLoading = true);
    try {
      final results = await _repository.searchErrors(
        query: query,
        brand: _selectedBrand.isNotEmpty ? _selectedBrand : null,
        category: _selectedCategory.isNotEmpty ? _selectedCategory : null,
      );
      if (mounted) {
        setState(() {
          _results = results;
          _isLoading = false;
        });

        // Consume quota (only for non-empty queries AND Free users)
        if (query.isNotEmpty &&
            _quotaService != null &&
            _userPlan?.isFree == true) {
          await _quotaService!.consumeErrorSearch();
        }

        if (query.isNotEmpty) {
          _historyRepository.addQuery(query).then((_) => _loadHistory());
        }
      }
    } catch (e) {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  void _showQuotaExhaustedDialog(UserQuota quota) {
    _permissionsService!.showQuotaExhaustedDialog(
      context,
      used: quota.errorSearchesUsed,
      limit: quota.totalLimit,
      onWatchAd: () async {
        final success = await AdService().showRewardedAd(
          onUserEarnedReward: () async {
            await _quotaService!.rewardFromAd();
            if (mounted) {
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(
                  content: Text('🎁 +1 lượt tra từ quảng cáo!'),
                  backgroundColor: Colors.green,
                ),
              );
            }
          },
        );

        if (!success && mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('Quảng cáo chưa sẵn sàng, thử lại sau'),
            ),
          );
        }
      },
      onUpgrade: () {
        context.push('/subscription');
      },
    );
  }

  void _onBrandFilter(String brand) {
    setState(() {
      _selectedBrand = _selectedBrand == brand ? '' : brand;
    });
    _performSearch(_searchController.text);
  }

  void _onCategoryFilter(String category) {
    setState(() {
      _selectedCategory = _selectedCategory == category ? '' : category;
    });
    _performSearch(_searchController.text);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: Column(
          children: [
            // 1. Fixed Header Section (Title + Search + Filters)
            Container(
              decoration: BoxDecoration(
                color: AppColors.background,
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withValues(alpha: 0.05),
                    offset: const Offset(0, 4),
                    blurRadius: 12,
                  ),
                ],
              ),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  _buildHeader(context),
                  _buildSearchBar(),
                  _buildCategoryBar(),
                  _buildFilterBar(),
                  const Gap(8),
                ],
              ),
            ),

            // Quota Indicator for Free Users
            if (_userPlan?.isFree == true && _quotaService != null)
              StreamBuilder<UserQuota>(
                stream: _quotaService!.watchTodayQuota(),
                builder: (context, snapshot) {
                  if (!snapshot.hasData) return const SizedBox.shrink();

                  return QuotaIndicator(
                    quota: snapshot.data!,
                    onWatchAd: () async {
                      final success = await AdService().showRewardedAd(
                        onUserEarnedReward: () async {
                          await _quotaService!.rewardFromAd();
                          if (context.mounted) {
                            ScaffoldMessenger.of(context).showSnackBar(
                              const SnackBar(
                                content: Text('🎁 +1 lượt tra từ quảng cáo!'),
                                backgroundColor: Colors.green,
                              ),
                            );
                          }
                        },
                      );

                      if (!success && context.mounted) {
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(
                            content: Text('Quảng cáo chưa sẵn sàng'),
                          ),
                        );
                      }
                    },
                    onUpgrade: () => context.push('/subscription'),
                  );
                },
              ),

            // 2. Scrollable Content
            Expanded(
              child: _isInitializing || _isLoading
                  ? const Center(
                      child: CircularProgressIndicator(
                        color: AppColors.primary,
                      ),
                    )
                  : _searchController.text.isEmpty && _history.isNotEmpty
                  ? _buildHistoryList()
                  : _results.isEmpty
                  ? _buildEmptyState()
                  : CustomScrollView(
                      keyboardDismissBehavior:
                          ScrollViewKeyboardDismissBehavior.onDrag,
                      physics: const BouncingScrollPhysics(),
                      slivers: [
                        SliverPadding(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 16,
                            vertical: 16,
                          ),
                          sliver: SliverList(
                            delegate: SliverChildBuilderDelegate((
                              context,
                              index,
                            ) {
                              return Padding(
                                padding: const EdgeInsets.only(bottom: 12),
                                child: _buildResultCard(
                                  context,
                                  _results[index],
                                ),
                              );
                            }, childCount: _results.length),
                          ),
                        ),
                      ],
                    ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildHistoryList() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.fromLTRB(16, 16, 16, 8),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text(
                'Tìm kiếm gần đây',
                style: TextStyle(
                  color: AppColors.textPrimary,
                  fontSize: 16,
                  fontWeight: FontWeight.bold,
                ),
              ),
              TextButton(
                onPressed: _clearHistory,
                child: const Text(
                  'Xóa tất cả',
                  style: TextStyle(
                    color: AppColors.textSecondary,
                    fontSize: 13,
                  ),
                ),
              ),
            ],
          ),
        ),
        Expanded(
          child: ListView.builder(
            itemCount: _history.length,
            padding: const EdgeInsets.symmetric(horizontal: 16),
            itemBuilder: (context, index) {
              final query = _history[index];

              return Dismissible(
                key: Key(query),
                direction: DismissDirection.endToStart,
                confirmDismiss: (_) async {
                  return await showDialog(
                    context: context,
                    builder: (context) => AlertDialog(
                      title: const Text('Xóa từ khóa này?'),
                      actions: [
                        TextButton(
                          onPressed: () => context.pop(false),
                          child: const Text(
                            'Hủy',
                            style: TextStyle(color: AppColors.textSecondary),
                          ),
                        ),
                        TextButton(
                          onPressed: () => context.pop(true),
                          child: const Text(
                            'Xóa',
                            style: TextStyle(color: Colors.red),
                          ),
                        ),
                      ],
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(16),
                      ),
                      backgroundColor: AppColors.surface,
                    ),
                  );
                },
                onDismissed: (_) => _deleteHistoryItem(query),
                background: Container(
                  alignment: Alignment.centerRight,
                  padding: const EdgeInsets.only(right: 20),
                  decoration: BoxDecoration(
                    color: Colors.red.withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: const Icon(
                    Icons.delete_outline_rounded,
                    color: Colors.red,
                  ),
                ),
                child: InkWell(
                  onTap: () {
                    _searchController.text = query;
                    _onSearchChanged(query);
                  },
                  borderRadius: BorderRadius.circular(12),
                  child: Padding(
                    padding: const EdgeInsets.symmetric(
                      vertical: 12,
                      horizontal: 8,
                    ),
                    child: Row(
                      children: [
                        const Icon(
                          Icons.history_rounded,
                          color: AppColors.textSecondary,
                          size: 20,
                        ),
                        const Gap(16),
                        Expanded(
                          child: Text(
                            query,
                            style: const TextStyle(
                              color: AppColors.textPrimary,
                              fontSize: 15,
                            ),
                          ),
                        ),
                        IconButton(
                          icon: const Icon(
                            Icons.close_rounded,
                            color: AppColors.textSecondary,
                            size: 18,
                          ),
                          onPressed: () => _deleteHistoryItem(query),
                          visualDensity: VisualDensity.compact,
                        ),
                      ],
                    ),
                  ),
                ),
              );
            },
          ),
        ),
      ],
    );
  }

  Widget _buildEmptyState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Container(
            padding: const EdgeInsets.all(24),
            decoration: BoxDecoration(
              color: AppColors.surface,
              shape: BoxShape.circle,
              boxShadow: [
                BoxShadow(
                  color: AppColors.primary.withValues(alpha: 0.1),
                  blurRadius: 20,
                  spreadRadius: 5,
                ),
              ],
            ),
            child: Icon(
              Icons.search_off_rounded,
              size: 48,
              color: AppColors.textSecondary.withValues(alpha: 0.5),
            ),
          ),
          const Gap(24),
          Text(
            _searchController.text.isEmpty
                ? 'Nhập mã lỗi, triệu chứng, hoặc model...'
                : 'Không tìm thấy kết quả nào',
            style: const TextStyle(
              color: AppColors.textPrimary,
              fontSize: 16,
              fontWeight: FontWeight.w600,
            ),
          ),
          if (_searchController.text.isNotEmpty) ...[
            const Gap(8),
            Text(
              'Thử tìm với từ khóa khác',
              style: TextStyle(
                color: AppColors.textSecondary.withValues(alpha: 0.8),
                fontSize: 14,
              ),
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildHeader(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 12, 16, 8),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Row(
            children: [
              Material(
                color: Colors.transparent,
                child: InkWell(
                  onTap: () {
                    if (context.canPop()) {
                      context.pop();
                    } else {
                      context.go('/home');
                    }
                  },
                  borderRadius: BorderRadius.circular(12),
                  child: Container(
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(
                      color: AppColors.surface,
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(
                        color: AppColors.textSecondary.withValues(alpha: 0.1),
                      ),
                    ),
                    child: const Icon(
                      Icons.arrow_back_rounded,
                      color: AppColors.textPrimary,
                      size: 20,
                    ),
                  ),
                ),
              ),
              const Gap(16),
              const Text(
                'Tra cứu',
                style: TextStyle(
                  color: AppColors.textPrimary,
                  fontSize: 24,
                  fontWeight: FontWeight.bold,
                  letterSpacing: -0.5,
                ),
              ),
            ],
          ),
          // Maybe an info icon or clean filter action
        ],
      ),
    );
  }

  Widget _buildSearchBar() {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 2),
        decoration: BoxDecoration(
          color: AppColors.surface,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(
            color: _searchController.text.isNotEmpty
                ? AppColors.primary.withValues(alpha: 0.5)
                : AppColors.textSecondary.withValues(alpha: 0.1),
          ),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.03),
              blurRadius: 10,
              offset: const Offset(0, 4),
            ),
          ],
        ),
        child: Row(
          children: [
            Icon(
              Icons.search_rounded,
              color: _searchController.text.isNotEmpty
                  ? AppColors.primary
                  : AppColors.textSecondary,
            ),
            const Gap(12),
            Expanded(
              child: TextField(
                controller: _searchController,
                onChanged: _onSearchChanged,
                style: const TextStyle(
                  color: AppColors.textPrimary,
                  fontWeight: FontWeight.w500,
                ),
                decoration: InputDecoration(
                  border: InputBorder.none,
                  hintText: 'Tìm mã lỗi, triệu chứng...',
                  hintStyle: TextStyle(
                    color: AppColors.textSecondary.withValues(alpha: 0.7),
                  ),
                ),
              ),
            ),
            if (_searchController.text.isNotEmpty)
              IconButton(
                onPressed: () {
                  _searchController.clear();
                  _onSearchChanged('');
                },
                icon: Container(
                  padding: const EdgeInsets.all(4),
                  decoration: BoxDecoration(
                    color: AppColors.textSecondary.withValues(alpha: 0.1),
                    shape: BoxShape.circle,
                  ),
                  child: const Icon(
                    Icons.close_rounded,
                    size: 14,
                    color: AppColors.textSecondary,
                  ),
                ),
              ),
          ],
        ),
      ),
    );
  }

  Widget _buildCategoryBar() {
    final categories = [
      {'id': 'AC', 'label': 'Điều hòa', 'icon': Icons.ac_unit_rounded},
      {
        'id': 'Washer',
        'label': 'Máy giặt',
        'icon': Icons.local_laundry_service_rounded,
      },
      {'id': 'Fridge', 'label': 'Tủ lạnh', 'icon': Icons.kitchen_rounded},
      {'id': 'Other', 'label': 'Khác', 'icon': Icons.devices_other_rounded},
    ];

    return SingleChildScrollView(
      scrollDirection: Axis.horizontal,
      padding: const EdgeInsets.fromLTRB(16, 0, 16, 8),
      child: Row(
        children: categories.map((cat) {
          final isSelected = _selectedCategory == cat['id'];
          return Padding(
            padding: const EdgeInsets.only(right: 8),
            child: InkWell(
              onTap: () => _onCategoryFilter(cat['id'] as String),
              borderRadius: BorderRadius.circular(12),
              child: AnimatedContainer(
                duration: const Duration(milliseconds: 200),
                padding: const EdgeInsets.symmetric(
                  horizontal: 12,
                  vertical: 8,
                ),
                decoration: BoxDecoration(
                  color: isSelected
                      ? AppColors.primary
                      : AppColors
                            .surface, // Changed from background to surface for better contrast
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(
                    color: isSelected
                        ? AppColors.primary
                        : AppColors.textSecondary.withValues(alpha: 0.1),
                  ),
                  boxShadow: isSelected
                      ? [
                          BoxShadow(
                            color: AppColors.primary.withValues(alpha: 0.3),
                            blurRadius: 8,
                            offset: const Offset(0, 2),
                          ),
                        ]
                      : [],
                ),
                child: Row(
                  children: [
                    Icon(
                      cat['icon'] as IconData,
                      size: 16,
                      color: isSelected
                          ? Colors.white
                          : AppColors.textSecondary,
                    ),
                    const Gap(6),
                    Text(
                      cat['label'] as String,
                      style: TextStyle(
                        color: isSelected
                            ? Colors.white
                            : AppColors.textSecondary,
                        fontSize: 13,
                        fontWeight: isSelected
                            ? FontWeight.w600
                            : FontWeight.w500,
                      ),
                    ),
                  ],
                ),
              ),
            ),
          );
        }).toList(),
      ),
    );
  }

  Widget _buildFilterBar() {
    final brandsAsync = ref.watch(brandsProvider);

    return SingleChildScrollView(
      scrollDirection: Axis.horizontal,
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      child: brandsAsync.when(
        data: (brands) {
          if (brands.isEmpty) return const SizedBox.shrink();
          return Row(
            children: brands.map((brand) {
              return Padding(
                padding: const EdgeInsets.only(right: 8),
                child: _buildFilterChip(
                  brand.name,
                  isActive: _selectedBrand == brand.name,
                  onTap: () => _onBrandFilter(brand.name),
                ),
              );
            }).toList(),
          );
        },
        loading: () => const SizedBox.shrink(),
        error: (err, stack) => const SizedBox.shrink(),
      ),
    );
  }

  Widget _buildFilterChip(
    String label, {
    bool isActive = false,
    VoidCallback? onTap,
  }) {
    return AnimatedContainer(
      duration: const Duration(milliseconds: 200),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(24),
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
          decoration: BoxDecoration(
            color: isActive ? AppColors.primary : AppColors.surface,
            borderRadius: BorderRadius.circular(24),
            border: Border.all(
              color: isActive
                  ? AppColors.primary
                  : AppColors.textSecondary.withValues(alpha: 0.1),
            ),
            boxShadow: isActive
                ? [
                    BoxShadow(
                      color: AppColors.primary.withValues(alpha: 0.3),
                      blurRadius: 8,
                      offset: const Offset(0, 2),
                    ),
                  ]
                : [],
          ),
          child: Text(
            label,
            style: TextStyle(
              color: isActive ? Colors.white : AppColors.textSecondary,
              fontSize: 14,
              fontWeight: isActive ? FontWeight.w600 : FontWeight.w500,
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildResultCard(BuildContext context, ErrorCode item) {
    return GestureDetector(
      onTap: () {
        context.push('/search-lookup/error-detail', extra: item);
      },
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: AppColors.surface,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(
            color: AppColors.textSecondary.withValues(alpha: 0.05),
          ),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.02),
              blurRadius: 10,
              offset: const Offset(0, 4),
            ),
          ],
        ),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Icon/Code Box
            Container(
              width: 56,
              height: 56,
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  colors: [
                    AppColors.primary.withValues(alpha: 0.1),
                    AppColors.primary.withValues(alpha: 0.05),
                  ],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                borderRadius: BorderRadius.circular(16),
                border: Border.all(
                  color: AppColors.primary.withValues(alpha: 0.1),
                ),
              ),
              child: Center(
                child: Text(
                  item.code,
                  style: const TextStyle(
                    color: AppColors.primary,
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                  ),
                  textAlign: TextAlign.center,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              ),
            ),
            const Gap(16),

            // Content
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 8,
                          vertical: 4,
                        ),
                        decoration: BoxDecoration(
                          color: AppColors.textSecondary.withValues(
                            alpha: 0.08,
                          ),
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Text(
                          item.brand.toUpperCase(),
                          style: TextStyle(
                            color: AppColors.textPrimary.withValues(alpha: 0.8),
                            fontSize: 10,
                            fontWeight: FontWeight.bold,
                            letterSpacing: 0.5,
                          ),
                        ),
                      ),
                      const Gap(8),
                      Expanded(
                        child: Text(
                          item.model,
                          style: TextStyle(
                            color: AppColors.textSecondary.withValues(
                              alpha: 0.8,
                            ),
                            fontSize: 11,
                            fontWeight: FontWeight.w500,
                          ),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                    ],
                  ),
                  const Gap(8),
                  Text(
                    item.title,
                    style: const TextStyle(
                      color: AppColors.textPrimary,
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                      height: 1.3,
                    ),
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                  ),
                  const Gap(6),
                  Text(
                    item.symptom.isNotEmpty
                        ? item.symptom
                        : (item.description ?? '...'),
                    style: TextStyle(
                      color: AppColors.textSecondary.withValues(alpha: 0.8),
                      fontSize: 13,
                      height: 1.4,
                    ),
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                  ),
                ],
              ),
            ),

            // Arrow
            const Padding(
              padding: EdgeInsets.only(left: 8, top: 20),
              child: Icon(
                Icons.arrow_forward_ios_rounded,
                size: 16,
                color: AppColors.textSecondary,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
