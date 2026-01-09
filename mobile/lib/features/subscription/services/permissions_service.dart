import 'package:flutter/material.dart';
import '../data/plan_model.dart';
import 'quota_service.dart';

class PermissionsService {
  final PlanModel plan;

  PermissionsService(this.plan);

  /// Can access measurement tools (thước đo, gas, etc.)
  bool canAccessTools() => plan.permissions.canUseTools;

  /// Can search errors (basic permission)
  bool canSearchErrors() => plan.permissions.canSearchErrors;

  /// Can export data (CSV, PDF, etc.)
  bool canExportData() => plan.permissions.canExportData;

  /// Has priority support
  bool hasPrioritySupport() => plan.permissions.hasPrioritySupport;

  /// Is ad-free experience
  bool hasAdsFree() => plan.permissions.hasAdsFree;

  /// Can perform error search (checks quota for Free users)
  Future<bool> canPerformErrorSearch(QuotaService quotaService) async {
    // Check basic permission first
    if (!canSearchErrors()) return false;

    // Paid plans: unlimited
    if (!plan.isFree || plan.quotas.isUnlimited) return true;

    // Free plan: check daily quota
    return await quotaService.canSearchError();
  }

  /// Show upgrade prompt dialog
  void showUpgradePrompt(
    BuildContext context, {
    required String feature,
    String? description,
  }) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Row(
          children: [
            Icon(Icons.lock, color: Colors.amber),
            SizedBox(width: 12),
            Expanded(child: Text('Tính năng Premium')),
          ],
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Nâng cấp để sử dụng: $feature',
              style: TextStyle(fontWeight: FontWeight.bold),
            ),
            if (description != null) ...[
              SizedBox(height: 8),
              Text(description, style: TextStyle(fontSize: 14)),
            ],
            SizedBox(height: 16),
            Container(
              padding: EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: Colors.blue.shade50,
                borderRadius: BorderRadius.circular(8),
              ),
              child: Row(
                children: [
                  Icon(Icons.info_outline, color: Colors.blue, size: 20),
                  SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      'Từ 49k/tháng - Sử dụng không giới hạn',
                      style: TextStyle(
                        fontSize: 12,
                        color: Colors.blue.shade900,
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: Text('Để sau'),
          ),
          ElevatedButton(
            onPressed: () {
              Navigator.pop(context);
              // Navigate to subscription screen using GoRouter if available, or named route
              try {
                // Assuming GoRouter is used and available in context
                // You might need to import go_router and use context.push('/subscription')
                // But since we don't have direct access here, we use Navigator.pushNamed if standard nav
                // Or try checking if context.canPop to ensure we are in a valid route stack
                Navigator.of(context).pushNamed('/subscription');
              } catch (e) {
                debugPrint('Error navigating: $e');
              }
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.blue,
              foregroundColor: Colors.white,
            ),
            child: Text('Nâng cấp ngay'),
          ),
        ],
      ),
    );
  }

  /// Show quota exhausted dialog (with ad option)
  void showQuotaExhaustedDialog(
    BuildContext context, {
    required int used,
    required int limit,
    required VoidCallback onWatchAd,
    required VoidCallback onUpgrade,
  }) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Row(
          children: [
            Icon(Icons.timer_off, color: Colors.orange),
            SizedBox(width: 12),
            Expanded(child: Text('Hết lượt tra')),
          ],
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Bạn đã dùng hết $limit lượt tra hôm nay.'),
            SizedBox(height: 12),
            Text(
              'Chọn một trong các cách sau:',
              style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
            ),
            SizedBox(height: 8),
            // Option 1: Watch Ad
            _buildOption(
              icon: Icons.play_circle_outline,
              title: 'Xem quảng cáo',
              subtitle: '15 giây → +1 lượt tra',
              color: Colors.green,
            ),
            SizedBox(height: 8),
            // Option 2: Upgrade
            _buildOption(
              icon: Icons.workspace_premium,
              title: 'Nâng cấp Plan',
              subtitle: 'Không giới hạn',
              color: Colors.blue,
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: Text('Đóng'),
          ),
          ElevatedButton.icon(
            onPressed: () {
              Navigator.pop(context);
              onWatchAd();
            },
            icon: Icon(Icons.play_arrow),
            label: Text('Xem Ads'),
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.green,
              foregroundColor: Colors.white,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildOption({
    required IconData icon,
    required String title,
    required String subtitle,
    required Color color,
  }) {
    return Container(
      padding: EdgeInsets.all(12),
      decoration: BoxDecoration(
        border: Border.all(color: color.withValues(alpha: 0.3)),
        borderRadius: BorderRadius.circular(8),
      ),
      child: Row(
        children: [
          Icon(icon, color: color),
          SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(title, style: TextStyle(fontWeight: FontWeight.bold)),
                Text(
                  subtitle,
                  style: TextStyle(fontSize: 12, color: Colors.grey.shade600),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
