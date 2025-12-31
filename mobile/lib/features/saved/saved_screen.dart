import 'package:flutter/material.dart';
import 'package:gap/gap.dart';
import 'package:go_router/go_router.dart';
import '../../core/constants/app_colors.dart';
import '../home/models/error_code_model.dart';

class SavedScreen extends StatefulWidget {
  const SavedScreen({super.key});

  @override
  State<SavedScreen> createState() => _SavedScreenState();
}

class _SavedScreenState extends State<SavedScreen> {
  // Dummy Data matching HTML
  late List<ErrorCode> _savedErrorCodes;

  @override
  void initState() {
    super.initState();
    _savedErrorCodes = [
      ErrorCode(
        id: '1',
        code: 'E1',
        title: 'Lỗi cảm biến',
        brand: 'Samsung',
        model: 'Điều hòa',
        symptom: 'Cảm biến nhiệt độ phòng bị lỗi.',
        cause: '',
        components: [],
        steps: [],
        status: 'active',
        severity: 'medium',
        updatedAt: DateTime.now(),
      ),
      ErrorCode(
        id: '2',
        code: 'H6',
        title: 'Lỗi mô tơ quạt',
        brand: 'LG',
        model: 'Máy giặt',
        symptom: 'Quạt không quay.',
        cause: '',
        components: [],
        steps: [],
        status: 'active',
        severity: 'high',
        updatedAt: DateTime.now(),
      ),
      ErrorCode(
        id: '3',
        code: 'PF',
        title: 'Lỗi nguồn điện',
        brand: 'Daikin',
        model: 'Tủ lạnh',
        symptom: 'Điện áp không ổn định.',
        cause: '',
        components: [],
        steps: [],
        status: 'active',
        severity: 'medium',
        updatedAt: DateTime.now(),
      ),
      ErrorCode(
        id: '4',
        code: 'OE',
        title: 'Lỗi xả nước',
        brand: 'LG',
        model: 'Máy rửa bát',
        symptom: 'Nước không xả ra ngoài.',
        cause: '',
        components: [],
        steps: [],
        status: 'active',
        severity: 'low',
        updatedAt: DateTime.now(),
      ),
      ErrorCode(
        id: '5',
        code: 'F0',
        title: 'Rò rỉ môi chất lạnh',
        brand: 'Gree',
        model: 'Điều hòa treo tường',
        symptom: 'Thiếu gas.',
        cause: '',
        components: [],
        steps: [],
        status: 'active',
        severity: 'high',
        updatedAt: DateTime.now(),
      ),
    ];
  }

  @override
  Widget build(BuildContext context) {
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
                    onPressed: () {},
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
                child: const TextField(
                  style: TextStyle(color: AppColors.textPrimary),
                  decoration: InputDecoration(
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
                  _buildFilterChip('Tất cả', isActive: true),
                  const Gap(8),
                  _buildFilterChip('Điều hòa'),
                  const Gap(8),
                  _buildFilterChip('Máy giặt'),
                  const Gap(8),
                  _buildFilterChip('Tủ lạnh'),
                ],
              ),
            ),

            // 4. List Info
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 4),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    '${_savedErrorCodes.length} mục đã lưu',
                    style: const TextStyle(
                      color: AppColors.textSecondary,
                      fontSize: 13,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
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
                        Icon(Icons.wifi_off, size: 12, color: Colors.green),
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

            const Gap(8),

            // 5. List
            Expanded(
              child: ListView.separated(
                padding: const EdgeInsets.symmetric(
                  horizontal: 16,
                  vertical: 8,
                ),
                itemCount: _savedErrorCodes.length,
                separatorBuilder: (_, _) => const Gap(12),
                itemBuilder: (context, index) {
                  return _buildSavedItem(_savedErrorCodes[index]);
                },
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildFilterChip(String label, {bool isActive = false}) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      decoration: BoxDecoration(
        color: isActive ? AppColors.primary : AppColors.surface,
        borderRadius: BorderRadius.circular(20),
        border: isActive
            ? null
            : Border.all(color: AppColors.textSecondary.withValues(alpha: 0.2)),
      ),
      child: Text(
        label,
        style: TextStyle(
          color: isActive ? Colors.white : AppColors.textSecondary,
          fontWeight: FontWeight.w500,
          fontSize: 13,
        ),
      ),
    );
  }

  Widget _buildSavedItem(ErrorCode item) {
    Color itemColor = AppColors.primary;
    Color bgColor = AppColors.primary.withValues(alpha: 0.1);
    Color borderColor = AppColors.primary.withValues(alpha: 0.1);

    // Hardcode styling based on HTML example logic
    if (item.code == 'H6') {
      itemColor = Colors.red;
      bgColor = Colors.red.withValues(alpha: 0.1);
      borderColor = Colors.red.withValues(alpha: 0.1);
    } else if (item.code == 'PF') {
      itemColor = Colors.amber;
      bgColor = Colors.amber.withValues(alpha: 0.1);
      borderColor = Colors.amber.withValues(alpha: 0.1);
    } else if (item.code == 'OE') {
      itemColor = AppColors.textSecondary;
      bgColor = AppColors.surface;
      borderColor = AppColors.textSecondary.withValues(alpha: 0.3);
    }

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
                    fontSize: 20,
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
                  Row(
                    children: [
                      const Icon(
                        Icons.menu_book,
                        size: 14,
                        color: AppColors.primary,
                      ),
                      const Gap(4),
                      const Text(
                        'Xem hướng dẫn',
                        style: TextStyle(
                          color: AppColors.primary,
                          fontSize: 12,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
            IconButton(
              onPressed: () {},
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
