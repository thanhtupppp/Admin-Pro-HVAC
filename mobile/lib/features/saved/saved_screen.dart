import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:gap/gap.dart';
import 'package:go_router/go_router.dart';
import '../../core/constants/app_colors.dart';
import '../home/models/error_code_model.dart';
import 'providers/saved_provider.dart';

class SavedScreen extends ConsumerStatefulWidget {
  const SavedScreen({super.key});

  @override
  ConsumerState<SavedScreen> createState() => _SavedScreenState();
}

class _SavedScreenState extends ConsumerState<SavedScreen> {
  String _selectedFilter = 'Tất cả';
  String _searchQuery = '';

  @override
  Widget build(BuildContext context) {
    final savedErrorsAsync = ref.watch(savedErrorsProvider);

    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: Column(
          children: [
            // 1. Header
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Row(
                    children: [
                      Container(
                        width: 40,
                        height: 40,
                        decoration: BoxDecoration(
                          color: AppColors.surface,
                          borderRadius: BorderRadius.circular(20),
                        ),
                        child: const Icon(
                          Icons.arrow_back,
                          color: AppColors.textPrimary,
                          size: 20,
                        ),
                      ),
                      const Gap(12),
                      const Text(
                        'Yêu thích',
                        style: TextStyle(
                          fontSize: 20,
                          fontWeight: FontWeight.bold,
                          color: AppColors.textPrimary,
                        ),
                      ),
                    ],
                  ),
                  TextButton(
                    onPressed: () {
                      // Edit mode could enable multi-select delete
                    },
                    style: TextButton.styleFrom(
                      foregroundColor: AppColors.primary,
                      backgroundColor: AppColors.primary.withValues(alpha: 0.1),
                    ),
                    child: const Text(
                      'Sửa',
                      style: TextStyle(fontWeight: FontWeight.bold),
                    ),
                  ),
                ],
              ),
            ),

            // 2. Search
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 16),
                decoration: BoxDecoration(
                  color: AppColors.surface,
                  borderRadius: BorderRadius.circular(12),
                ),
                child: TextField(
                  style: const TextStyle(color: AppColors.textPrimary),
                  onChanged: (val) {
                    setState(() {
                      _searchQuery = val;
                    });
                  },
                  decoration: const InputDecoration(
                    icon: Icon(Icons.search, color: AppColors.textSecondary),
                    border: InputBorder.none,
                    hintText: 'Tìm mã lỗi (ví dụ: E1, H6)...',
                    hintStyle: TextStyle(color: AppColors.textSecondary),
                  ),
                ),
              ),
            ),

            // 3. Filters
            SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              child: Row(
                children: [
                  _buildFilterChip('Tất cả'),
                  const Gap(8),
                  _buildFilterChip('Điều hòa'),
                  const Gap(8),
                  _buildFilterChip('Máy giặt'),
                  const Gap(8),
                  _buildFilterChip('Tủ lạnh'),
                ],
              ),
            ),

            // 4. List Content
            Expanded(
              child: savedErrorsAsync.when(
                data: (errors) {
                  // Filter list locally
                  var filteredErrors = errors;

                  if (_selectedFilter != 'Tất cả') {
                    // Simple heuristic filter mapping
                    filteredErrors = filteredErrors.where((e) {
                      final brandModel = '${e.brand} ${e.model}'.toLowerCase();
                      if (_selectedFilter == 'Điều hòa') {
                        return brandModel.contains('điều hòa') ||
                            brandModel.contains('air conditioner');
                      } else if (_selectedFilter == 'Máy giặt') {
                        return brandModel.contains('máy giặt') ||
                            brandModel.contains('washer');
                      } else if (_selectedFilter == 'Tủ lạnh') {
                        return brandModel.contains('tủ lạnh') ||
                            brandModel.contains('fridge');
                      }
                      return true;
                    }).toList();
                  }

                  if (_searchQuery.isNotEmpty) {
                    filteredErrors = filteredErrors.where((e) {
                      return e.code.toLowerCase().contains(
                            _searchQuery.toLowerCase(),
                          ) ||
                          e.title.toLowerCase().contains(
                            _searchQuery.toLowerCase(),
                          );
                    }).toList();
                  }

                  if (filteredErrors.isEmpty) {
                    return Center(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(
                            Icons.bookmark_border,
                            size: 64,
                            color: AppColors.textSecondary.withValues(
                              alpha: 0.5,
                            ),
                          ),
                          const Gap(16),
                          Text(
                            errors.isEmpty
                                ? 'Chưa có lỗi nào được lưu'
                                : 'Không tìm thấy kết quả',
                            style: const TextStyle(
                              color: AppColors.textSecondary,
                              fontSize: 16,
                            ),
                          ),
                        ],
                      ),
                    );
                  }

                  return Column(
                    children: [
                      Padding(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 20,
                          vertical: 4,
                        ),
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text(
                              '${filteredErrors.length} mục đã lưu',
                              style: const TextStyle(
                                color: AppColors.textSecondary,
                                fontSize: 13,
                                fontWeight: FontWeight.w500,
                              ),
                            ),
                            // Offline badge simulated
                            Container(
                              padding: const EdgeInsets.symmetric(
                                horizontal: 8,
                                vertical: 4,
                              ),
                              decoration: BoxDecoration(
                                color: Colors.green.withValues(alpha: 0.1),
                                borderRadius: BorderRadius.circular(6),
                                border: Border.all(
                                  color: Colors.green.withValues(alpha: 0.2),
                                ),
                              ),
                              child: const Row(
                                children: [
                                  Icon(
                                    Icons.wifi_off,
                                    size: 12,
                                    color: Colors.green,
                                  ),
                                  Gap(4),
                                  Text(
                                    'SẴN SÀNG OFFLINE',
                                    style: TextStyle(
                                      color: Colors.green,
                                      fontSize: 10,
                                      fontWeight: FontWeight.bold,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),
                      ),
                      Expanded(
                        child: ListView.separated(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 16,
                            vertical: 8,
                          ),
                          itemCount: filteredErrors.length,
                          separatorBuilder: (_, _) => const Gap(12),
                          itemBuilder: (context, index) {
                            return _buildSavedItem(filteredErrors[index]);
                          },
                        ),
                      ),
                    ],
                  );
                },
                loading: () => const Center(child: CircularProgressIndicator()),
                error: (err, stack) =>
                    Center(child: Text('Lỗi tải dữ liệu: $err')),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildFilterChip(String label) {
    final isActive = _selectedFilter == label;
    return GestureDetector(
      onTap: () {
        setState(() {
          _selectedFilter = label;
        });
      },
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        decoration: BoxDecoration(
          color: isActive ? AppColors.primary : AppColors.surface,
          borderRadius: BorderRadius.circular(20),
          border: isActive
              ? null
              : Border.all(
                  color: AppColors.textSecondary.withValues(alpha: 0.2),
                ),
        ),
        child: Text(
          label,
          style: TextStyle(
            color: isActive ? Colors.white : AppColors.textSecondary,
            fontWeight: FontWeight.w500,
            fontSize: 13,
          ),
        ),
      ),
    );
  }

  Widget _buildSavedItem(ErrorCode item) {
    // Dynamic color based on brand roughly
    Color itemColor = AppColors.primary;
    if (item.brand.toLowerCase().contains('lg')) itemColor = Colors.red;
    if (item.brand.toLowerCase().contains('daikin')) itemColor = Colors.blue;
    if (item.brand.toLowerCase().contains('gree')) itemColor = Colors.green;

    Color bgColor = itemColor.withValues(alpha: 0.1);
    Color borderColor = itemColor.withValues(alpha: 0.2);

    return GestureDetector(
      onTap: () {
        context.push('/saved/error-detail', extra: item);
      },
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: AppColors.surface,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(
            color: AppColors.textSecondary.withValues(alpha: 0.1),
          ),
        ),
        child: Row(
          children: [
            Container(
              width: 56,
              height: 56,
              decoration: BoxDecoration(
                color: bgColor,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: borderColor),
              ),
              child: Center(
                child: Text(
                  item.code,
                  style: TextStyle(
                    color: itemColor,
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
            ),
            const Gap(16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    item.title,
                    style: const TextStyle(
                      color: AppColors.textPrimary,
                      fontWeight: FontWeight.bold,
                      fontSize: 15,
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                  const Gap(4),
                  Text(
                    '${item.brand} • ${item.model}',
                    style: const TextStyle(
                      color: AppColors.textSecondary,
                      fontSize: 13,
                    ),
                  ),
                  const Gap(6),
                ],
              ),
            ),
            IconButton(
              onPressed: () {
                // Remove from saved
                ref.read(savedIdsProvider.notifier).toggle(item.id);
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(
                    content: Text('Đã xóa khỏi mục yêu thích'),
                    duration: Duration(seconds: 1),
                  ),
                );
              },
              icon: const Icon(
                Icons.bookmark_remove,
                color: AppColors.textSecondary,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
