import 'package:flutter/material.dart';
import 'package:admin_pro_mobile/features/subscription/data/user_quota_model.dart';

class QuotaIndicator extends StatelessWidget {
  final UserQuota quota;
  final VoidCallback? onWatchAd;
  final VoidCallback? onUpgrade;

  const QuotaIndicator({
    super.key,
    required this.quota,
    this.onWatchAd,
    this.onUpgrade,
  });

  @override
  Widget build(BuildContext context) {
    final remaining = quota.remaining;
    final total = quota.totalLimit;
    final percentage = remaining / total;

    // Colors based on quota
    Color bgColor;
    Color textColor;
    IconData icon;

    if (remaining == 0) {
      bgColor = Colors.red.shade50;
      textColor = Colors.red.shade700;
      icon = Icons.warning_amber_rounded;
    } else if (percentage <= 0.3) {
      bgColor = Colors.orange.shade50;
      textColor = Colors.orange.shade700;
      icon = Icons.info_outline;
    } else {
      bgColor = Colors.blue.shade50;
      textColor = Colors.blue.shade700;
      icon = Icons.check_circle_outline;
    }

    return Container(
      margin: const EdgeInsets.all(16),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: bgColor,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: textColor.withValues(alpha: 0.3)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header
          Row(
            children: [
              Icon(icon, color: textColor, size: 20),
              const SizedBox(width: 8),
              Expanded(
                child: Text(
                  remaining > 0
                      ? 'Còn $remaining/$total lượt tra hôm nay'
                      : 'Hết lượt tra hôm nay',
                  style: TextStyle(
                    fontWeight: FontWeight.bold,
                    color: textColor,
                    fontSize: 14,
                  ),
                ),
              ),
            ],
          ),

          // Progress bar
          const SizedBox(height: 12),
          ClipRRect(
            borderRadius: BorderRadius.circular(4),
            child: LinearProgressIndicator(
              value: percentage,
              backgroundColor: textColor.withValues(alpha: 0.2),
              valueColor: AlwaysStoppedAnimation<Color>(textColor),
              minHeight: 6,
            ),
          ),

          // Actions
          if (remaining == 0 && onWatchAd != null) ...[
            const SizedBox(height: 12),
            Row(
              children: [
                Expanded(
                  child: OutlinedButton.icon(
                    onPressed: onWatchAd,
                    icon: const Icon(Icons.play_circle_outline, size: 18),
                    label: const Text('Xem Ads +1'),
                    style: OutlinedButton.styleFrom(
                      foregroundColor: Colors.green,
                      side: BorderSide(color: Colors.green.shade300),
                    ),
                  ),
                ),
                if (onUpgrade != null) ...[
                  const SizedBox(width: 8),
                  Expanded(
                    child: ElevatedButton.icon(
                      onPressed: onUpgrade,
                      icon: const Icon(Icons.workspace_premium, size: 18),
                      label: const Text('Nâng cấp'),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.blue,
                        foregroundColor: Colors.white,
                      ),
                    ),
                  ),
                ],
              ],
            ),
          ],

          // Info text
          if (quota.adRewardsEarned > 0) ...[
            const SizedBox(height: 8),
            Text(
              '🎁 +${quota.adRewardsEarned} từ quảng cáo',
              style: TextStyle(
                fontSize: 12,
                color: textColor.withValues(alpha: 0.7),
                fontStyle: FontStyle.italic,
              ),
            ),
          ],
        ],
      ),
    );
  }
}

/// Compact quota badge
class QuotaBadge extends StatelessWidget {
  final int remaining;
  final int total;

  const QuotaBadge({super.key, required this.remaining, required this.total});

  @override
  Widget build(BuildContext context) {
    final color = remaining == 0
        ? Colors.red
        : remaining <= 2
        ? Colors.orange
        : Colors.green;

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: color.shade50,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: color.shade300),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(Icons.search, size: 14, color: color.shade700),
          const SizedBox(width: 4),
          Text(
            '$remaining/$total',
            style: TextStyle(
              fontSize: 12,
              fontWeight: FontWeight.bold,
              color: color.shade700,
            ),
          ),
        ],
      ),
    );
  }
}
