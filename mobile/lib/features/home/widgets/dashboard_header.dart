import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart'; // Add import
import 'package:gap/gap.dart';
import '../../../../core/constants/app_colors.dart';
import '../providers/home_provider.dart'; // Add import

class DashboardHeader extends ConsumerWidget {
  // Change to ConsumerWidget
  final String? photoUrl;

  const DashboardHeader({super.key, this.photoUrl});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    // Add ref
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 16, 16, 0),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text(
                'Trợ Lý Điện Lạnh',
                style: TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.bold,
                  color: AppColors.textPrimary,
                ),
              ),
              const Gap(4),
              Row(
                children: [
                  Icon(Icons.check_circle, color: Colors.green[500], size: 16),
                  const Gap(4),
                  const Text(
                    'Chế độ ngoại tuyến',
                    style: TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.w500,
                      color: AppColors.textSecondary,
                    ),
                  ),
                ],
              ),
            ],
          ),
          InkWell(
            // Wrap with InkWell
            onTap: () {
              // Navigate to Profile tab (Index 4)
              ref.read(homeTabIndexProvider.notifier).setIndex(4);
            },
            borderRadius: BorderRadius.circular(20),
            child: Container(
              width: 40,
              height: 40,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                border: Border.all(color: AppColors.surface, width: 1),
                image: photoUrl != null
                    ? DecorationImage(
                        image: NetworkImage(photoUrl!),
                        fit: BoxFit.cover,
                      )
                    : null,
                color: AppColors.surface,
              ),
              child: photoUrl == null
                  ? const Icon(Icons.person, color: AppColors.textSecondary)
                  : null,
            ),
          ),
        ],
      ),
    );
  }
}
