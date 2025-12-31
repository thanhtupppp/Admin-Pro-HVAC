import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:gap/gap.dart';
import 'package:go_router/go_router.dart';
import '../../core/constants/app_colors.dart';
import '../home/models/error_code_model.dart';

class TroubleshootScreen extends ConsumerStatefulWidget {
  final ErrorCode errorCode;

  const TroubleshootScreen({super.key, required this.errorCode});

  @override
  ConsumerState<TroubleshootScreen> createState() => _TroubleshootScreenState();
}

class _TroubleshootScreenState extends ConsumerState<TroubleshootScreen> {
  int currentStep = 1;

  int get totalSteps => widget.errorCode.steps.length;

  String get currentStepContent {
    if (widget.errorCode.steps.isEmpty) return '';
    final index = currentStep - 1;
    if (index < 0 || index >= widget.errorCode.steps.length) return '';
    return widget.errorCode.steps[index];
  }

  @override
  Widget build(BuildContext context) {
    final errorCode = widget.errorCode;

    // Nếu không có steps, hiển thị thông báo
    if (errorCode.steps.isEmpty) {
      return Scaffold(
        backgroundColor: AppColors.background,
        appBar: AppBar(
          backgroundColor: AppColors.background,
          leading: IconButton(
            icon: const Icon(Icons.arrow_back, color: Colors.white),
            onPressed: () => context.pop(),
          ),
          title: Text(
            'Mã lỗi ${errorCode.code}',
            style: const TextStyle(color: Colors.white),
          ),
        ),
        body: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(
                Icons.info_outline,
                size: 64,
                color: AppColors.textSecondary,
              ),
              const Gap(16),
              Text(
                'Chưa có quy trình kiểm tra',
                style: TextStyle(color: AppColors.textSecondary, fontSize: 18),
              ),
              const Gap(8),
              Text(
                'Vui lòng thêm các bước xử lý trên Web Admin',
                style: TextStyle(color: AppColors.textSecondary, fontSize: 14),
              ),
            ],
          ),
        ),
      );
    }

    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: Column(
          children: [
            _buildHeader(context, errorCode),
            Expanded(
              child: SingleChildScrollView(
                padding: const EdgeInsets.only(bottom: 100),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Hero Section with Step Title
                    Container(
                      width: double.infinity,
                      padding: const EdgeInsets.all(20),
                      decoration: const BoxDecoration(
                        gradient: LinearGradient(
                          begin: Alignment.topCenter,
                          end: Alignment.bottomCenter,
                          colors: [Color(0xFF1E3A5F), AppColors.background],
                        ),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'BƯỚC $currentStep',
                            style: const TextStyle(
                              fontSize: 12,
                              fontWeight: FontWeight.bold,
                              color: AppColors.primary,
                              letterSpacing: 2,
                            ),
                          ),
                          const Gap(8),
                          Text(
                            currentStepContent,
                            style: const TextStyle(
                              fontSize: 22,
                              fontWeight: FontWeight.bold,
                              color: Colors.white,
                              height: 1.3,
                            ),
                          ),
                        ],
                      ),
                    ),

                    Padding(
                      padding: const EdgeInsets.all(20),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          // Tools Required (if available)
                          if (errorCode.tools.isNotEmpty) ...[
                            const Text(
                              'CÔNG CỤ CẦN THIẾT',
                              style: TextStyle(
                                fontSize: 12,
                                fontWeight: FontWeight.bold,
                                color: AppColors.textSecondary,
                                letterSpacing: 1.0,
                              ),
                            ),
                            const Gap(12),
                            Wrap(
                              spacing: 10,
                              runSpacing: 10,
                              children: errorCode.tools
                                  .map((tool) => _buildToolChip(tool))
                                  .toList(),
                            ),
                            const Gap(24),
                          ],

                          // Components Related (if available)
                          if (errorCode.components.isNotEmpty) ...[
                            const Text(
                              'LINH KIỆN LIÊN QUAN',
                              style: TextStyle(
                                fontSize: 12,
                                fontWeight: FontWeight.bold,
                                color: AppColors.textSecondary,
                                letterSpacing: 1.0,
                              ),
                            ),
                            const Gap(12),
                            Wrap(
                              spacing: 10,
                              runSpacing: 10,
                              children: errorCode.components
                                  .map((comp) => _buildComponentChip(comp))
                                  .toList(),
                            ),
                            const Gap(24),
                          ],

                          // All Steps Overview
                          const Text(
                            'TẤT CẢ CÁC BƯỚC',
                            style: TextStyle(
                              fontSize: 12,
                              fontWeight: FontWeight.bold,
                              color: AppColors.textSecondary,
                              letterSpacing: 1.0,
                            ),
                          ),
                          const Gap(12),
                          ...errorCode.steps.asMap().entries.map((entry) {
                            final idx = entry.key + 1;
                            final step = entry.value;
                            final isCurrentStep = idx == currentStep;
                            final isCompleted = idx < currentStep;

                            return GestureDetector(
                              onTap: () {
                                setState(() {
                                  currentStep = idx;
                                });
                              },
                              child: Container(
                                margin: const EdgeInsets.only(bottom: 12),
                                padding: const EdgeInsets.all(16),
                                decoration: BoxDecoration(
                                  color: isCurrentStep
                                      ? AppColors.primary.withValues(alpha: 0.1)
                                      : AppColors.surface,
                                  borderRadius: BorderRadius.circular(12),
                                  border: Border.all(
                                    color: isCurrentStep
                                        ? AppColors.primary
                                        : const Color(0xFF1E293B),
                                    width: isCurrentStep ? 2 : 1,
                                  ),
                                ),
                                child: Row(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Container(
                                      width: 28,
                                      height: 28,
                                      decoration: BoxDecoration(
                                        color: isCompleted
                                            ? Colors.green
                                            : isCurrentStep
                                            ? AppColors.primary
                                            : const Color(0xFF334155),
                                        shape: BoxShape.circle,
                                      ),
                                      child: Center(
                                        child: isCompleted
                                            ? const Icon(
                                                Icons.check,
                                                color: Colors.white,
                                                size: 16,
                                              )
                                            : Text(
                                                '$idx',
                                                style: TextStyle(
                                                  color: isCurrentStep
                                                      ? Colors.white
                                                      : AppColors.textSecondary,
                                                  fontWeight: FontWeight.bold,
                                                  fontSize: 12,
                                                ),
                                              ),
                                      ),
                                    ),
                                    const Gap(12),
                                    Expanded(
                                      child: Text(
                                        step,
                                        style: TextStyle(
                                          color: isCurrentStep
                                              ? Colors.white
                                              : AppColors.textSecondary,
                                          fontSize: 14,
                                          height: 1.4,
                                          fontWeight: isCurrentStep
                                              ? FontWeight.w600
                                              : FontWeight.normal,
                                        ),
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            );
                          }),

                          // Cause info if available
                          if (errorCode.cause.isNotEmpty) ...[
                            const Gap(12),
                            Container(
                              padding: const EdgeInsets.all(12),
                              decoration: BoxDecoration(
                                color: Colors.amber.withValues(alpha: 0.1),
                                borderRadius: BorderRadius.circular(8),
                                border: Border.all(
                                  color: Colors.amber.withValues(alpha: 0.2),
                                ),
                              ),
                              child: Row(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Icon(
                                    Icons.lightbulb_outline,
                                    color: Colors.amber.shade400,
                                    size: 20,
                                  ),
                                  const Gap(12),
                                  Expanded(
                                    child: Column(
                                      crossAxisAlignment:
                                          CrossAxisAlignment.start,
                                      children: [
                                        const Text(
                                          'Nguyên nhân có thể',
                                          style: TextStyle(
                                            color: Colors.amber,
                                            fontWeight: FontWeight.bold,
                                            fontSize: 12,
                                          ),
                                        ),
                                        const Gap(4),
                                        Text(
                                          errorCode.cause,
                                          style: TextStyle(
                                            color: Colors.amber.shade200,
                                            fontSize: 13,
                                            height: 1.4,
                                          ),
                                        ),
                                      ],
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ),
            _buildBottomNavigation(),
          ],
        ),
      ),
    );
  }

  Widget _buildHeader(BuildContext context, ErrorCode errorCode) {
    final progress = totalSteps > 0 ? currentStep / totalSteps : 0.0;

    return Container(
      decoration: const BoxDecoration(
        color: AppColors.background,
        border: Border(bottom: BorderSide(color: Color(0xFF1E293B))),
      ),
      padding: const EdgeInsets.fromLTRB(16, 12, 16, 16),
      child: Column(
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              IconButton(
                onPressed: () => context.pop(),
                icon: const Icon(Icons.arrow_back, color: Colors.white),
              ),
              Column(
                children: [
                  Text(
                    'MÃ LỖI ${errorCode.code}',
                    style: const TextStyle(
                      fontSize: 12,
                      color: AppColors.textSecondary,
                      fontWeight: FontWeight.bold,
                      letterSpacing: 1.0,
                    ),
                  ),
                  Text(
                    errorCode.title,
                    style: const TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.bold,
                      color: Colors.white,
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                ],
              ),
              IconButton(
                onPressed: () => context.pop(),
                icon: const Icon(Icons.close, color: AppColors.textSecondary),
              ),
            ],
          ),
          const Gap(12),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'Bước $currentStep trên $totalSteps',
                style: const TextStyle(
                  color: AppColors.primary,
                  fontWeight: FontWeight.bold,
                  fontSize: 13,
                ),
              ),
              Text(
                'Hoàn thành ${(progress * 100).toInt()}%',
                style: const TextStyle(
                  color: AppColors.textSecondary,
                  fontSize: 12,
                  fontWeight: FontWeight.w500,
                ),
              ),
            ],
          ),
          const Gap(8),
          ClipRRect(
            borderRadius: BorderRadius.circular(4),
            child: LinearProgressIndicator(
              value: progress,
              backgroundColor: const Color(0xFF334155),
              color: AppColors.primary,
              minHeight: 6,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildBottomNavigation() {
    final isFirstStep = currentStep == 1;
    final isLastStep = currentStep == totalSteps;

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: const BoxDecoration(
        color: AppColors.background,
        border: Border(top: BorderSide(color: Color(0xFF1E293B))),
      ),
      child: Row(
        children: [
          Expanded(
            flex: 1,
            child: SizedBox(
              height: 52,
              child: OutlinedButton(
                onPressed: isFirstStep
                    ? null
                    : () {
                        setState(() {
                          currentStep--;
                        });
                      },
                style: OutlinedButton.styleFrom(
                  side: BorderSide(
                    color: isFirstStep
                        ? const Color(0xFF1E293B)
                        : const Color(0xFF334155),
                  ),
                  foregroundColor: isFirstStep
                      ? AppColors.textSecondary
                      : Colors.white,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                  backgroundColor: const Color(0xFF1E293B),
                ),
                child: const Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(Icons.arrow_back, size: 18),
                    Gap(8),
                    Text(
                      'Trước',
                      style: TextStyle(fontWeight: FontWeight.bold),
                    ),
                  ],
                ),
              ),
            ),
          ),
          const Gap(12),
          Expanded(
            flex: 2,
            child: SizedBox(
              height: 52,
              child: ElevatedButton(
                onPressed: () {
                  if (isLastStep) {
                    // Hoàn thành - quay về màn hình trước
                    context.pop();
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(
                        content: Text('Hoàn thành quy trình kiểm tra!'),
                        backgroundColor: Colors.green,
                      ),
                    );
                  } else {
                    setState(() {
                      currentStep++;
                    });
                  }
                },
                style: ElevatedButton.styleFrom(
                  backgroundColor: isLastStep
                      ? Colors.green
                      : AppColors.primary,
                  foregroundColor: Colors.white,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                  elevation: 4,
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Text(
                      isLastStep ? 'Hoàn thành' : 'Bước tiếp theo',
                      style: const TextStyle(
                        fontWeight: FontWeight.bold,
                        fontSize: 16,
                      ),
                    ),
                    const Gap(8),
                    Icon(
                      isLastStep ? Icons.check : Icons.arrow_forward,
                      size: 20,
                    ),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildToolChip(String label) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: const Color(0xFF334155)),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          const Icon(Icons.build, size: 16, color: AppColors.primary),
          const Gap(8),
          Text(
            label,
            style: const TextStyle(
              fontSize: 13,
              color: Colors.white,
              fontWeight: FontWeight.w500,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildComponentChip(String label) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      decoration: BoxDecoration(
        color: Colors.blue.withValues(alpha: 0.1),
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: Colors.blue.withValues(alpha: 0.3)),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          const Icon(Icons.memory, size: 16, color: Colors.blue),
          const Gap(8),
          Text(
            label,
            style: const TextStyle(
              fontSize: 13,
              color: Colors.blue,
              fontWeight: FontWeight.w500,
            ),
          ),
        ],
      ),
    );
  }
}
