import 'package:flutter/material.dart';
import 'package:gap/gap.dart';
import 'package:go_router/go_router.dart';
import '../../core/constants/app_colors.dart';
import '../home/models/error_code_model.dart';
// Reuse ErrorCode but wrap it or create ad-hoc model for history structure

class HistoryScreen extends StatefulWidget {
  const HistoryScreen({super.key});

  @override
  State<HistoryScreen> createState() => _HistoryScreenState();
}

class _HistoryScreenState extends State<HistoryScreen> {
  // Mock Data
  final Map<String, List<HistoryItem>> _historyGroups = {
    'HÔM NAY': [
      HistoryItem(
        code: 'E4',
        title: 'Cảm biến nhiệt độ phòng',
        brand: 'Samsung',
        model: 'AR12TX',
        time: '10:42 AM',
        icon: Icons.ac_unit,
        hasNotification: true,
        errorCode: ErrorCode(
          id: '1',
          code: 'E4',
          title: 'Cảm biến nhiệt độ phòng',
          brand: 'Samsung',
          model: 'AR12TX',
          symptom: 'Symptom...',
          cause: 'Cause...',
          components: [],
          steps: [],
          status: 'active',
          severity: 'medium',
          updatedAt: DateTime.now(),
        ),
      ),
      HistoryItem(
        code: 'LE',
        title: 'Quá tải động cơ',
        brand: 'LG',
        model: 'WM3400',
        time: '09:15 AM',
        icon: Icons.water_drop,
        errorCode: ErrorCode(
          id: '2',
          code: 'LE',
          title: 'Quá tải động cơ',
          brand: 'LG',
          model: 'WM3400',
          symptom: 'Symptom...',
          cause: 'Cause...',
          components: [],
          steps: [],
          status: 'active',
          severity: 'medium',
          updatedAt: DateTime.now(),
        ),
      ),
    ],
    'HÔM QUA': [
      HistoryItem(
        code: 'SY CF',
        title: 'Lỗi giao tiếp',
        brand: 'Electrolux',
        model: 'EI23',
        time: '4:30 PM',
        icon: Icons.kitchen,
        errorCode: ErrorCode(
          id: '3',
          code: 'SY CF',
          title: 'Lỗi giao tiếp',
          brand: 'Electrolux',
          model: 'EI23',
          symptom: 'Symptom...',
          cause: 'Cause...',
          components: [],
          steps: [],
          status: 'active',
          severity: 'medium',
          updatedAt: DateTime.now(),
        ),
      ),
      HistoryItem(
        code: 'F1',
        title: 'Lỗi đánh lửa',
        brand: 'York',
        model: 'TG9S',
        time: '11:05 AM',
        icon: Icons.whatshot, // Was mode_heat
        errorCode: ErrorCode(
          id: '4',
          code: 'F1',
          title: 'Lỗi đánh lửa',
          brand: 'York',
          model: 'TG9S',
          symptom: 'Symptom...',
          cause: 'Cause...',
          components: [],
          steps: [],
          status: 'active',
          severity: 'high',
          updatedAt: DateTime.now(),
        ),
      ),
    ],
    'TUẦN TRƯỚC': [
      HistoryItem(
        code: 'H6',
        title: 'Mô tơ quạt dàn lạnh',
        brand: 'Gree',
        model: 'Lomo',
        time: 'Thứ 2',
        icon: Icons.warning,
        errorCode: ErrorCode(
          id: '5',
          code: 'H6',
          title: 'Mô tơ quạt dàn lạnh',
          brand: 'Gree',
          model: 'Lomo',
          symptom: 'Symptom...',
          cause: 'Cause...',
          components: [],
          steps: [],
          status: 'active',
          severity: 'medium',
          updatedAt: DateTime.now(),
        ),
      ),
    ],
  };

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
                  const Text(
                    'Lịch sử tìm kiếm',
                    style: TextStyle(
                      fontSize: 20,
                      fontWeight: FontWeight.bold,
                      color: AppColors.textPrimary,
                    ),
                  ),
                  TextButton(
                    onPressed: () {},
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
                child: const TextField(
                  style: TextStyle(color: AppColors.textPrimary),
                  decoration: InputDecoration(
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
              child: ListView(
                padding: const EdgeInsets.symmetric(horizontal: 16),
                children: _historyGroups.entries.map((entry) {
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
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildHistoryCard(HistoryItem item) {
    return GestureDetector(
      onTap: () {
        context.push('/history/error-detail', extra: item.errorCode);
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
            Stack(
              clipBehavior: Clip.none,
              children: [
                Container(
                  width: 48,
                  height: 48,
                  decoration: BoxDecoration(
                    color: AppColors.primary.withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Icon(item.icon, color: AppColors.primary, size: 24),
                ),
                if (item.hasNotification)
                  Positioned(
                    top: -2,
                    right: -2,
                    child: Container(
                      width: 10,
                      height: 10,
                      decoration: BoxDecoration(
                        color: Colors.red,
                        shape: BoxShape.circle,
                        border: Border.all(color: AppColors.surface, width: 2),
                      ),
                    ),
                  ),
              ],
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
                        item.code,
                        style: const TextStyle(
                          color: AppColors.textPrimary,
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      Text(
                        item.time,
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
                    item.title,
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
                    '${item.brand} • ${item.model}',
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
            const Icon(Icons.chevron_right, color: AppColors.textSecondary),
          ],
        ),
      ),
    );
  }
}

class HistoryItem {
  final String code;
  final String title;
  final String brand;
  final String model;
  final String time;
  final IconData icon;
  final bool hasNotification;
  final ErrorCode errorCode;

  HistoryItem({
    required this.code,
    required this.title,
    required this.brand,
    required this.model,
    required this.time,
    required this.icon,
    this.hasNotification = false,
    required this.errorCode,
  });
}
