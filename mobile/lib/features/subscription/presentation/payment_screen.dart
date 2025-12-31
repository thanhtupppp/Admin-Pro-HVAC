import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:gap/gap.dart';
import 'package:go_router/go_router.dart';
import '../../../core/constants/app_colors.dart';
import '../data/plan_model.dart';
import '../data/bank_settings_model.dart';
import '../data/bank_settings_repository.dart';
import '../data/transaction_model.dart';
import '../data/transaction_repository.dart';
import '../../auth/providers/auth_provider.dart';

class PaymentScreen extends ConsumerStatefulWidget {
  final PlanModel plan;

  const PaymentScreen({super.key, required this.plan});

  @override
  ConsumerState<PaymentScreen> createState() => _PaymentScreenState();
}

class _PaymentScreenState extends ConsumerState<PaymentScreen> {
  bool _isConfirming = false;

  @override
  Widget build(BuildContext context) {
    final bankSettingsAsync = ref.watch(bankSettingsProvider);

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: Colors.white),
          onPressed: () => context.pop(),
        ),
        title: const Text(
          'Thanh toán',
          style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
        ),
        centerTitle: true,
      ),
      body: bankSettingsAsync.when(
        loading: () => const Center(
          child: CircularProgressIndicator(color: AppColors.primary),
        ),
        error: (err, stack) => Center(
          child: Text(
            'Lỗi tải cấu hình: $err',
            style: const TextStyle(color: Colors.red),
          ),
        ),
        data: (bankSettings) {
          return SingleChildScrollView(
            padding: const EdgeInsets.all(20),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Plan Summary
                _buildPlanSummary(widget.plan),
                const Gap(24),

                // Payment Methods
                const Text(
                  'Phương thức thanh toán',
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const Gap(16),
                _buildPaymentOption(
                  icon: Icons.qr_code_2,
                  title: 'Chuyển khoản / VietQR',
                  subtitle: 'Tự động xác nhận (Khuyên dùng)',
                  isSelected: true,
                ),
                const Gap(12),
                _buildPaymentOption(
                  icon: Icons.account_balance_wallet,
                  title: 'Ví MoMo',
                  subtitle: 'Đang bảo trì',
                  isSelected: false,
                  isDisabled: true,
                ),
                const Gap(24),

                // QR Section
                _buildQrCodeSection(context, bankSettings, widget.plan),
              ],
            ),
          );
        },
      ),
    );
  }

  Widget _buildPlanSummary(PlanModel plan) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.primary.withValues(alpha: 0.3)),
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: AppColors.primary.withValues(alpha: 0.1),
              shape: BoxShape.circle,
            ),
            child: const Icon(
              Icons.diamond,
              color: AppColors.primary,
              size: 24,
            ),
          ),
          const Gap(16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Gói ${plan.displayName}',
                  style: const TextStyle(
                    color: Colors.white,
                    fontWeight: FontWeight.bold,
                    fontSize: 16,
                  ),
                ),
                Text(
                  plan.formattedPrice,
                  style: const TextStyle(
                    color: AppColors.textSecondary,
                    fontSize: 14,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildPaymentOption({
    required IconData icon,
    required String title,
    required String subtitle,
    bool isSelected = false,
    bool isDisabled = false,
  }) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: isSelected
            ? AppColors.primary.withValues(alpha: 0.1)
            : AppColors.surface,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: isSelected ? AppColors.primary : Colors.transparent,
          width: 2,
        ),
      ),
      child: Row(
        children: [
          Icon(
            icon,
            color: isDisabled
                ? Colors.grey
                : (isSelected ? AppColors.primary : Colors.white),
          ),
          const Gap(16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: TextStyle(
                    color: isDisabled ? Colors.grey : Colors.white,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                Text(
                  subtitle,
                  style: TextStyle(
                    color: isDisabled ? Colors.grey : AppColors.textSecondary,
                    fontSize: 12,
                  ),
                ),
              ],
            ),
          ),
          if (isSelected)
            const Icon(Icons.check_circle, color: AppColors.primary),
        ],
      ),
    );
  }

  Widget _buildQrCodeSection(
    BuildContext context,
    BankSettingsModel bankSettings,
    PlanModel plan,
  ) {
    // Generate QR URL from bankSettings
    final transferContent = 'THANH TOAN ${plan.name.toUpperCase()}';
    final encodedContent = Uri.encodeComponent(transferContent);
    final encodedName = Uri.encodeComponent(bankSettings.accountName);

    final qrUrl =
        'https://img.vietqr.io/image/${bankSettings.bankId}-${bankSettings.accountNumber}-${bankSettings.template}.png?amount=${plan.price}&addInfo=$encodedContent&accountName=$encodedName';

    return Column(
      children: [
        // QR Image Card
        Container(
          padding: const EdgeInsets.all(24),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(20),
          ),
          child: Column(
            children: [
              Image.network(
                qrUrl,
                height: 200,
                width: 200,
                fit: BoxFit.contain,
                loadingBuilder: (context, child, loadingProgress) {
                  if (loadingProgress == null) return child;
                  return const SizedBox(
                    height: 200,
                    width: 200,
                    child: Center(
                      child: CircularProgressIndicator(
                        color: AppColors.primary,
                      ),
                    ),
                  );
                },
                errorBuilder: (context, error, stackTrace) {
                  return const SizedBox(
                    height: 200,
                    width: 200,
                    child: Center(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(
                            Icons.broken_image,
                            color: Colors.grey,
                            size: 50,
                          ),
                          Text(
                            'Lỗi tải QR',
                            style: TextStyle(color: Colors.grey, fontSize: 12),
                          ),
                        ],
                      ),
                    ),
                  );
                },
              ),
              const Gap(16),
              const Text(
                'Quét mã để thanh toán',
                style: TextStyle(
                  color: Colors.black,
                  fontWeight: FontWeight.bold,
                ),
              ),
              const Gap(4),
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 8,
                      vertical: 2,
                    ),
                    decoration: BoxDecoration(
                      border: Border.all(color: Colors.blue),
                      borderRadius: BorderRadius.circular(4),
                    ),
                    child: const Text(
                      'VietQR',
                      style: TextStyle(
                        color: Colors.blue,
                        fontWeight: FontWeight.bold,
                        fontSize: 12,
                      ),
                    ),
                  ),
                  const Gap(8),
                  Text(
                    bankSettings.bankId,
                    style: const TextStyle(
                      color: Colors.black,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
        const Gap(24),

        // Info Card
        Container(
          padding: const EdgeInsets.all(20),
          decoration: BoxDecoration(
            color: AppColors.surface,
            borderRadius: BorderRadius.circular(16),
          ),
          child: Column(
            children: [
              _buildCopyRow(context, 'Ngân hàng', bankSettings.bankName),
              const Divider(color: Color(0xFF334155)),
              _buildCopyRow(
                context,
                'Số tài khoản',
                bankSettings.accountNumber,
              ),
              const Divider(color: Color(0xFF334155)),
              _buildCopyRow(context, 'Chủ tài khoản', bankSettings.accountName),
              const Divider(color: Color(0xFF334155)),
              _buildCopyRow(context, 'Số tiền', plan.formattedPrice),
              const Divider(color: Color(0xFF334155)),
              _buildCopyRow(context, 'Nội dung', transferContent),
            ],
          ),
        ),
        const Gap(24),

        // Confirm Button
        SizedBox(
          width: double.infinity,
          height: 50,
          child: ElevatedButton(
            onPressed: _isConfirming
                ? null
                : () => _handleConfirmPayment(context),
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.primary,
              foregroundColor: Colors.white,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(12),
              ),
            ),
            child: _isConfirming
                ? const SizedBox(
                    height: 20,
                    width: 20,
                    child: CircularProgressIndicator(
                      color: Colors.white,
                      strokeWidth: 2,
                    ),
                  )
                : const Text(
                    'Tôi đã chuyển khoản xong',
                    style: TextStyle(fontWeight: FontWeight.bold),
                  ),
          ),
        ),
      ],
    );
  }

  Future<void> _handleConfirmPayment(BuildContext context) async {
    setState(() => _isConfirming = true);

    try {
      final authState = ref.read(authProvider);
      final user = authState.user;
      final userData = authState.userData;

      if (user == null) {
        throw Exception('User not logged in');
      }

      final repository = ref.read(transactionRepositoryProvider);
      final transaction = TransactionModel(
        id: '', // Firestore will generate this
        userId: user.uid,
        userEmail: user.email ?? userData?['email'] ?? '',
        planId: widget.plan.id,
        planName: widget.plan.displayName.isNotEmpty
            ? widget.plan.displayName
            : (widget.plan.name.isNotEmpty
                  ? widget.plan.name
                  : 'Gói VIP (${widget.plan.id.substring(0, 5)})'),
        amount: widget.plan.price,
        status: 'pending',
        paymentMethod: 'vietqr',
        createdAt: DateTime.now(),
        updatedAt: DateTime.now(),
      );

      await repository.createTransaction(transaction);

      if (context.mounted) {
        _showSuccessDialog(context);
      }
    } catch (e) {
      if (context.mounted) {
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(SnackBar(content: Text('Lỗi: ${e.toString()}')));
      }
    } finally {
      if (mounted) {
        setState(() => _isConfirming = false);
      }
    }
  }

  Widget _buildCopyRow(BuildContext context, String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: const TextStyle(color: AppColors.textSecondary)),
          Row(
            children: [
              Text(
                value.length > 20
                    ? '${value.substring(0, 18)}...'
                    : value, // Truncate if too long
                style: const TextStyle(
                  color: Colors.white,
                  fontWeight: FontWeight.w500,
                ),
              ),
              const Gap(8),
              GestureDetector(
                onTap: () {
                  Clipboard.setData(ClipboardData(text: value));
                  ScaffoldMessenger.of(
                    context,
                  ).showSnackBar(SnackBar(content: Text('Đã sao chép $label')));
                },
                child: const Icon(
                  Icons.copy,
                  color: AppColors.primary,
                  size: 16,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  void _showSuccessDialog(BuildContext context) {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) => AlertDialog(
        backgroundColor: AppColors.surface,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Icon(Icons.check_circle, color: Colors.green, size: 60),
            const Gap(16),
            const Text(
              'Gửi xác nhận thành công!',
              style: TextStyle(
                color: Colors.white,
                fontSize: 18,
                fontWeight: FontWeight.bold,
              ),
              textAlign: TextAlign.center,
            ),
            const Gap(8),
            const Text(
              'Hệ thống sẽ kích hoạt gói của bạn sau khi nhận được tiền (thường trong 5 phút).',
              style: TextStyle(color: AppColors.textSecondary, fontSize: 14),
              textAlign: TextAlign.center,
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () {
              context.pop(); // Close dialog
              context.pushReplacement('/settings/transactions');
            },
            child: const Text(
              'Xem lịch sử',
              style: TextStyle(
                color: AppColors.primary,
                fontWeight: FontWeight.bold,
              ),
            ),
          ),
          TextButton(
            onPressed: () {
              context.pop(); // Close dialog
              context.pop(); // Close Payment Screen
            },
            child: const Text(
              'Đóng',
              style: TextStyle(
                color: Colors.white70,
                fontWeight: FontWeight.bold,
              ),
            ),
          ),
        ],
      ),
    );
  }
}
