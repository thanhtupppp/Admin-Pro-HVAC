import 'package:flutter/material.dart';
import 'package:gap/gap.dart';
import 'package:intl/intl.dart';
import '../../core/constants/app_colors.dart';

class NotificationScreen extends StatelessWidget {
  const NotificationScreen({super.key});

  @override
  Widget build(BuildContext context) {
    // Dummy Data
    final notifications = [
      {
        'title': 'Cảnh báo hệ thống',
        'body':
            'Phát hiện lỗi E1 trên thiết bị Điều hòa Samsung tại Khu vực A.',
        'time': DateTime.now().subtract(const Duration(minutes: 15)),
        'isRead': false,
        'type': 'alert',
      },
      {
        'title': 'Cập nhật bảo trì',
        'body': 'Đã hoàn thành bảo trì định kỳ cho hệ thống VRV IV.',
        'time': DateTime.now().subtract(const Duration(hours: 2)),
        'isRead': true,
        'type': 'info',
      },
      {
        'title': 'Chào mừng thành viên mới',
        'body': 'Chào mừng bạn đến với HVAC Admin Pro! Hãy bắt đầu khám phá.',
        'time': DateTime.now().subtract(const Duration(days: 1)),
        'isRead': true,
        'type': 'success',
      },
      {
        'title': 'Nhắc nhở công việc',
        'body': 'Bạn có 3 task cần hoàn thành trong tuần này.',
        'time': DateTime.now().subtract(const Duration(days: 2)),
        'isRead': true,
        'type': 'warning',
      },
    ];

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('Thông báo'),
        backgroundColor: AppColors.background,
        elevation: 0,
        foregroundColor: AppColors.textPrimary,
        actions: [
          IconButton(
            onPressed: () {},
            icon: const Icon(Icons.done_all),
            tooltip: 'Đánh dấu đã đọc hết',
          ),
        ],
      ),
      body: notifications.isEmpty
          ? Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(
                    Icons.notifications_off_outlined,
                    size: 80,
                    color: AppColors.textSecondary.withValues(alpha: 0.5),
                  ),
                  const Gap(16),
                  const Text(
                    'Không có thông báo mới',
                    style: TextStyle(
                      color: AppColors.textSecondary,
                      fontSize: 16,
                    ),
                  ),
                ],
              ),
            )
          : ListView.separated(
              padding: const EdgeInsets.all(16),
              itemCount: notifications.length,
              separatorBuilder: (_, _) => const Gap(12),
              itemBuilder: (context, index) {
                final item = notifications[index];
                final isRead = item['isRead'] as bool;
                final type = item['type'] as String;

                Color iconColor;
                IconData iconData;

                switch (type) {
                  case 'alert':
                    iconColor = AppColors.error;
                    iconData = Icons.error_outline;
                    break;
                  case 'success':
                    iconColor = AppColors.success;
                    iconData = Icons.check_circle_outline;
                    break;
                  case 'warning':
                    iconColor = Colors.orange;
                    iconData = Icons.warning_amber_rounded;
                    break;
                  default:
                    iconColor = AppColors.primary;
                    iconData = Icons.info_outline;
                }

                return Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: isRead
                        ? AppColors.surface
                        : AppColors.surface.withValues(
                            alpha: 0.6,
                          ), // Active look for unread maybe? Actually surface is standard. Let's make unread highlight.
                    // Let's implement unread highlight logic:
                    // Read: Surface color
                    // Unread: Surface color + border or slightly lighter using withValues
                  ),
                  child: Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Container(
                        padding: const EdgeInsets.all(10),
                        decoration: BoxDecoration(
                          color: isRead
                              ? AppColors.background
                              : iconColor.withValues(alpha: 0.1),
                          shape: BoxShape.circle,
                        ),
                        child: Icon(iconData, color: iconColor, size: 24),
                      ),
                      const Gap(16),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Expanded(
                                  child: Text(
                                    item['title'] as String,
                                    style: TextStyle(
                                      color: AppColors.textPrimary,
                                      fontWeight: isRead
                                          ? FontWeight.w600
                                          : FontWeight.bold,
                                      fontSize: 15,
                                    ),
                                  ),
                                ),
                                if (!isRead)
                                  Container(
                                    width: 8,
                                    height: 8,
                                    decoration: const BoxDecoration(
                                      color: AppColors.error,
                                      shape: BoxShape.circle,
                                    ),
                                  ),
                              ],
                            ),
                            const Gap(4),
                            Text(
                              item['body'] as String,
                              style: const TextStyle(
                                color: AppColors.textSecondary,
                                fontSize: 13,
                                height: 1.4,
                              ),
                            ),
                            const Gap(8),
                            Text(
                              DateFormat(
                                'HH:mm - dd/MM/yyyy',
                              ).format(item['time'] as DateTime),
                              style: TextStyle(
                                color: AppColors.textSecondary.withValues(
                                  alpha: 0.7,
                                ),
                                fontSize: 11,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                );
              },
            ),
    );
  }
}
