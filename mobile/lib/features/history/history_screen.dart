import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:gap/gap.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';
import '../../core/constants/app_colors.dart';
import 'providers/history_provider.dart';

class HistoryScreen extends ConsumerStatefulWidget {
  const HistoryScreen({super.key});

  @override
  ConsumerState<HistoryScreen> createState() => _HistoryScreenState();
}

class _HistoryScreenState extends ConsumerState<HistoryScreen> {
  String _searchQuery = '';

  Map<String, List<HistoryDisplayItem>> _groupHistoryItems(
    List<HistoryDisplayItem> items,
  ) {
    final Map<String, List<HistoryDisplayItem>> grouped = {};
    final now = DateTime.now();
    final today = DateTime(now.year, now.month, now.day);
    final yesterday = today.subtract(const Duration(days: 1));

    for (var item in items) {
      final date = item.entry.timestamp;
      final dateOnly = DateTime(date.year, date.month, date.day);

      String key;
      if (dateOnly == today) {
        key = 'HÔM NAY';
      } else if (dateOnly == yesterday) {
        key = 'HÔM QUA';
      } else {
        // Format: dd/MM/yyyy
        key = DateFormat('dd/MM/yyyy').format(date);
      }

      if (!grouped.containsKey(key)) {
        grouped[key] = [];
      }
      grouped[key]!.add(item);
    }
    return grouped;
  }

  @override
  Widget build(BuildContext context) {
    final historyAsync = ref.watch(historyItemsProvider);

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
                  const Text(
                    'Lịch sử tìm kiếm',
                    style: TextStyle(
                      fontSize: 20,
                      fontWeight: FontWeight.bold,
                      color: AppColors.textPrimary,
                    ),
                  ),
                  TextButton(
                    onPressed: () {
                      _showClearHistoryDialog(context);
                    },
                    child: const Text(
                      'Xóa',
                      style: TextStyle(
                        color: AppColors.primary,
                        fontWeight: FontWeight.bold,
                      ),
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
                  border: Border.all(
                    color: AppColors.textSecondary.withValues(alpha: 0.2),
                  ),
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
                    hintText: 'Tìm theo mã lỗi, hãng hoặc model...',
                    hintStyle: TextStyle(color: AppColors.textSecondary),
                  ),
                ),
              ),
            ),
            const Gap(16),

            // 3. List
            Expanded(
              child: historyAsync.when(
                data: (items) {
                  // Local filtered
                  var filteredItems = items;
                  if (_searchQuery.isNotEmpty) {
                    filteredItems = filteredItems.where((item) {
                      final e = item.errorCode;
                      final query = _searchQuery.toLowerCase();
                      return e.code.toLowerCase().contains(query) ||
                          e.brand.toLowerCase().contains(query) ||
                          e.model.toLowerCase().contains(query);
                    }).toList();
                  }

                  if (filteredItems.isEmpty) {
                    return Center(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(
                            Icons.history,
                            size: 64,
                            color: AppColors.textSecondary.withValues(
                              alpha: 0.5,
                            ),
                          ),
                          const Gap(16),
                          Text(
                            items.isEmpty
                                ? 'Chưa có lịch sử tìm kiếm'
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

                  final groupedItems = _groupHistoryItems(filteredItems);

                  return ListView(
                    padding: const EdgeInsets.symmetric(horizontal: 16),
                    children: groupedItems.entries.map((entry) {
                      return Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Padding(
                            padding: const EdgeInsets.symmetric(
                              vertical: 8,
                              horizontal: 4,
                            ),
                            child: Text(
                              entry.key,
                              style: const TextStyle(
                                color: AppColors.textSecondary,
                                fontSize: 13,
                                fontWeight: FontWeight.bold,
                                letterSpacing: 0.5,
                              ),
                            ),
                          ),
                          ...entry.value.map((item) => _buildHistoryCard(item)),
                          const Gap(16),
                        ],
                      );
                    }).toList(),
                  );
                },
                loading: () => const Center(child: CircularProgressIndicator()),
                error: (err, stack) => Center(child: Text('Lỗi: $err')),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Future<void> _showClearHistoryDialog(BuildContext context) async {
    return showDialog(
      context: context,
      builder: (context) => AlertDialog(
        backgroundColor: AppColors.surface,
        title: const Text(
          'Xóa lịch sử?',
          style: TextStyle(color: Colors.white),
        ),
        content: const Text(
          'Bạn có chắc muốn xóa toàn bộ lịch sử tìm kiếm không?',
          style: TextStyle(color: AppColors.textSecondary),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Hủy'),
          ),
          TextButton(
            onPressed: () {
              ref.read(historyNotifierProvider.notifier).clearHistory();
              Navigator.pop(context);
            },
            child: const Text('Xóa', style: TextStyle(color: Colors.red)),
          ),
        ],
      ),
    );
  }

  Widget _buildHistoryCard(HistoryDisplayItem item) {
    final e = item.errorCode;
    final timeStr = DateFormat('HH:mm').format(item.entry.timestamp);

    return GestureDetector(
      onTap: () {
        context.push('/history/error-detail', extra: e);
      },
      child: Container(
        margin: const EdgeInsets.only(bottom: 12),
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
            // Icon Box
            Container(
              width: 48,
              height: 48,
              decoration: BoxDecoration(
                color: AppColors.primary.withValues(alpha: 0.1),
                borderRadius: BorderRadius.circular(12),
              ),
              child: const Icon(
                Icons.history,
                color: AppColors.primary,
                size: 24,
              ),
            ),
            const Gap(16),

            // Content
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        e.code,
                        style: const TextStyle(
                          color: AppColors.textPrimary,
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      Text(
                        timeStr,
                        style: const TextStyle(
                          color: AppColors.textSecondary,
                          fontSize: 12,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                    ],
                  ),
                  const Gap(4),
                  Text(
                    e.title,
                    style: TextStyle(
                      color: AppColors.textPrimary.withValues(alpha: 0.9),
                      fontSize: 14,
                      fontWeight: FontWeight.w500,
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                  const Gap(2),
                  Text(
                    '${e.brand} • ${e.model}',
                    style: const TextStyle(
                      color: AppColors.textSecondary,
                      fontSize: 12,
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                ],
              ),
            ),
            const Gap(8),
            IconButton(
              icon: const Icon(
                Icons.close,
                color: AppColors.textSecondary,
                size: 20,
              ),
              onPressed: () {
                ref
                    .read(historyNotifierProvider.notifier)
                    .removeItem(item.entry.errorId);
              },
            ),
          ],
        ),
      ),
    );
  }
}
