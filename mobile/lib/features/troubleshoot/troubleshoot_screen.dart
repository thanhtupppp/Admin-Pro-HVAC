import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:gap/gap.dart';
import 'package:go_router/go_router.dart';
import '../../core/constants/app_colors.dart';

class TroubleshootScreen extends ConsumerStatefulWidget {
  const TroubleshootScreen({super.key});

  @override
  ConsumerState<TroubleshootScreen> createState() => _TroubleshootScreenState();
}

class _TroubleshootScreenState extends ConsumerState<TroubleshootScreen> {
  // State for progress simulation
  int currentStep = 2;
  int totalSteps = 5;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: Column(
          children: [
            _buildHeader(context),
            Expanded(
              child: SingleChildScrollView(
                padding: const EdgeInsets.only(bottom: 100),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Hero Image
                    Container(
                      height: 220,
                      width: double.infinity,
                      decoration: const BoxDecoration(
                        border: Border(
                          bottom: BorderSide(
                            color: Color(0xFF1E293B),
                            width: 1,
                          ),
                        ),
                      ),
                      child: Stack(
                        fit: StackFit.expand,
                        children: [
                          Image.network(
                            'https://lh3.googleusercontent.com/aida-public/AB6AXuBXsmU3gjpQ6m2RkM9Rb-zhgPN6EaqI9SWfzwKNY22_U70xYyh_MbS9wGqwciuzMc8otx2wK_W4yNa0aXsT4Gc3B78u8EhJzHVOaCUgRW1PVGYPulvEcXa0Hc66UDhf9Dx3i9UpJoBCkpq3SVyn3AAfgoKczeien0WLaYZxgZcbLKNYfdgFjEKS346ALdzMnErCkBn3Z4zUE07Mz2PEtQNcIhEs-viedmfbyi4izdnlx_Ndz0X6OZfwScSQvKCY4VuZ7ws3-oaAIp0',
                            fit: BoxFit.cover,
                            errorBuilder: (context, error, stackTrace) =>
                                Container(
                                  color: AppColors.surface,
                                  child: const Icon(
                                    Icons.image_not_supported,
                                    color: AppColors.textSecondary,
                                  ),
                                ),
                          ),
                          Container(
                            decoration: BoxDecoration(
                              gradient: LinearGradient(
                                begin: Alignment.topCenter,
                                end: Alignment.bottomCenter,
                                colors: [
                                  Colors.transparent,
                                  AppColors.background.withValues(alpha: 0.6),
                                ],
                              ),
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
                          // Step Title
                          const Text(
                            'Kiểm tra tụ điện',
                            style: TextStyle(
                              fontSize: 28,
                              fontWeight: FontWeight.bold,
                              color: Colors.white,
                              height: 1.2,
                            ),
                          ),
                          const Gap(8),
                          const Text(
                            'Xác minh tính toàn vẹn điện của tụ khởi động để đảm bảo nó giữ và xả điện tích chính xác.',
                            style: TextStyle(
                              fontSize: 15,
                              color: AppColors.textSecondary,
                              height: 1.5,
                            ),
                          ),

                          const Gap(24),

                          // Tools Required
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
                            children: [
                              _buildToolChip(
                                'Đồng hồ vạn năng',
                                Icons.electric_meter,
                              ),
                              _buildToolChip(
                                'Tô vít cách điện',
                                Icons.construction,
                              ),
                              _buildToolChip(
                                'Găng tay bảo hộ',
                                Icons.back_hand,
                              ),
                            ],
                          ),

                          const Gap(24),

                          // Instruction Steps
                          const Row(
                            children: [
                              StepIndicator(number: '1'),
                              Gap(12),
                              Text(
                                'Xả tụ điện',
                                style: TextStyle(
                                  fontSize: 16,
                                  fontWeight: FontWeight.bold,
                                  color: Colors.white,
                                ),
                              ),
                            ],
                          ),
                          const Padding(
                            padding: EdgeInsets.only(
                              left: 36,
                              top: 4,
                              bottom: 16,
                            ),
                            child: Text(
                              'Dùng tô vít cách điện nối tắt các cực của tụ điện với nhau để xả an toàn năng lượng tích trữ.',
                              style: TextStyle(
                                color: AppColors.textSecondary,
                                fontSize: 14,
                                height: 1.4,
                              ),
                            ),
                          ),

                          const Row(
                            children: [
                              StepIndicator(number: '2'),
                              Gap(12),
                              Text(
                                'Đo điện trở',
                                style: TextStyle(
                                  fontSize: 16,
                                  fontWeight: FontWeight.bold,
                                  color: Colors.white,
                                ),
                              ),
                            ],
                          ),
                          const Padding(
                            padding: EdgeInsets.only(
                              left: 36,
                              top: 4,
                              bottom: 16,
                            ),
                            child: Text(
                              'Đặt đồng hồ vạn năng về thang đo Ohm (Ω). Đặt que đen vào cực Chung (C) và que đỏ vào cực Herm (H).',
                              style: TextStyle(
                                color: AppColors.textSecondary,
                                fontSize: 14,
                                height: 1.4,
                              ),
                            ),
                          ),

                          const Row(
                            children: [
                              StepIndicator(number: '3'),
                              Gap(12),
                              Text(
                                'Quan sát chỉ số',
                                style: TextStyle(
                                  fontSize: 16,
                                  fontWeight: FontWeight.bold,
                                  color: Colors.white,
                                ),
                              ),
                            ],
                          ),
                          const Padding(
                            padding: EdgeInsets.only(
                              left: 36,
                              top: 4,
                              bottom: 16,
                            ),
                            child: Text(
                              'Quan sát màn hình. Điện trở sẽ tăng nhanh rồi giảm về vô cùng (OL).',
                              style: TextStyle(
                                color: AppColors.textSecondary,
                                fontSize: 14,
                                height: 1.4,
                              ),
                            ),
                          ),

                          const Gap(12),

                          // Diagnostic Check
                          LayoutBuilder(
                            builder: (context, constraints) {
                              return Container(
                                decoration: BoxDecoration(
                                  color: AppColors.surface,
                                  borderRadius: BorderRadius.circular(16),
                                  border: Border.all(
                                    color: const Color(0xFF1E293B),
                                  ),
                                ),
                                clipBehavior: Clip.antiAlias,
                                child: Column(
                                  children: [
                                    Container(
                                      padding: const EdgeInsets.all(16),
                                      decoration: const BoxDecoration(
                                        border: Border(
                                          left: BorderSide(
                                            color: Colors.amber,
                                            width: 4,
                                          ),
                                        ),
                                      ),
                                      child: const Column(
                                        crossAxisAlignment:
                                            CrossAxisAlignment.start,
                                        children: [
                                          Row(
                                            children: [
                                              Icon(
                                                Icons.help_outline,
                                                color: Colors.amber,
                                                size: 20,
                                              ),
                                              Gap(10),
                                              Text(
                                                'Kiểm tra chẩn đoán',
                                                style: TextStyle(
                                                  fontSize: 18,
                                                  fontWeight: FontWeight.bold,
                                                  color: Colors.white,
                                                ),
                                              ),
                                            ],
                                          ),
                                          Gap(8),
                                          Text(
                                            'Chỉ số trên đồng hồ có tăng lên rồi giảm về vô cùng không?',
                                            style: TextStyle(
                                              color: AppColors.textSecondary,
                                              fontSize: 14,
                                            ),
                                          ),
                                        ],
                                      ),
                                    ),
                                    Padding(
                                      padding: const EdgeInsets.all(16),
                                      child: Column(
                                        children: [
                                          _buildDiagnosticOption(
                                            isCorrect: true,
                                            text: 'Có, hoạt động đúng',
                                            actionText: 'ĐẾN BƯỚC 3',
                                          ),
                                          const Gap(12),
                                          _buildDiagnosticOption(
                                            isCorrect: false,
                                            text: 'Không, giữ ở 0 hoặc OL',
                                            actionText: 'THAY THẾ',
                                          ),
                                        ],
                                      ),
                                    ),
                                  ],
                                ),
                              );
                            },
                          ),

                          const Gap(24),

                          // Warning
                          Container(
                            padding: const EdgeInsets.all(12),
                            decoration: BoxDecoration(
                              color: Colors.red.withValues(alpha: 0.1),
                              borderRadius: BorderRadius.circular(8),
                              border: Border.all(
                                color: Colors.red.withValues(alpha: 0.2),
                              ),
                            ),
                            child: Row(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Icon(
                                  Icons.warning_amber_rounded,
                                  color: Colors.red.shade400,
                                  size: 20,
                                ),
                                const Gap(12),
                                Expanded(
                                  child: Text(
                                    'Cảnh báo: Nguy hiểm điện cao áp. Đảm bảo đã ngắt nguồn điện tại cầu dao trước khi tiến hành.',
                                    style: TextStyle(
                                      color: Colors.red.shade200,
                                      fontSize: 13,
                                      height: 1.4,
                                    ),
                                  ),
                                ),
                              ],
                            ),
                          ),
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

  Widget _buildHeader(BuildContext context) {
    // Progress calculation
    final progress = currentStep / totalSteps;

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
              const Column(
                children: [
                  Text(
                    'LỖI E12',
                    style: TextStyle(
                      fontSize: 12,
                      color: AppColors.textSecondary,
                      fontWeight: FontWeight.bold,
                      letterSpacing: 1.0,
                    ),
                  ),
                  Text(
                    'Chẩn đoán động cơ quạt',
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                      color: Colors.white,
                    ),
                  ),
                ],
              ),
              IconButton(
                onPressed: () {},
                icon: const Icon(Icons.list, color: AppColors.primary),
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
                onPressed: () {
                  setState(() {
                    if (currentStep > 1) currentStep--;
                  });
                },
                style: OutlinedButton.styleFrom(
                  side: const BorderSide(color: Color(0xFF334155)),
                  foregroundColor: Colors.white,
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
                    ), // Shortened for space
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
                  setState(() {
                    if (currentStep < totalSteps) currentStep++;
                  });
                },
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.primary,
                  foregroundColor: Colors.white,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                  elevation: 4,
                ),
                child: const Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Text(
                      'Bước tiếp theo',
                      style: TextStyle(
                        fontWeight: FontWeight.bold,
                        fontSize: 16,
                      ),
                    ),
                    Gap(8),
                    Icon(Icons.arrow_forward, size: 20),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildToolChip(String label, IconData icon) {
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
          Icon(icon, size: 18, color: AppColors.primary),
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

  Widget _buildDiagnosticOption({
    required bool isCorrect,
    required String text,
    required String actionText,
  }) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      decoration: BoxDecoration(
        color: AppColors.background.withValues(alpha: 0.5),
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: const Color(0xFF334155)),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Row(
            children: [
              Icon(
                isCorrect ? Icons.check_circle : Icons.cancel,
                color: isCorrect ? Colors.green : Colors.red,
                size: 22,
              ),
              const Gap(12),
              Text(
                text,
                style: const TextStyle(
                  fontSize: 14,
                  color: Colors.white,
                  fontWeight: FontWeight.w500,
                ),
              ),
            ],
          ),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
            decoration: BoxDecoration(
              color: isCorrect
                  ? AppColors.primary.withValues(alpha: 0.1)
                  : Colors.grey.withValues(alpha: 0.2),
              borderRadius: BorderRadius.circular(4),
            ),
            child: Text(
              actionText,
              style: TextStyle(
                fontSize: 11,
                fontWeight: FontWeight.bold,
                color: isCorrect ? AppColors.primary : AppColors.textSecondary,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class StepIndicator extends StatelessWidget {
  final String number;
  const StepIndicator({super.key, required this.number});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 24,
      height: 24,
      decoration: const BoxDecoration(
        color: AppColors.primary,
        shape: BoxShape.circle,
      ),
      child: Center(
        child: Text(
          number,
          style: const TextStyle(
            color: Colors.white,
            fontSize: 12,
            fontWeight: FontWeight.bold,
          ),
        ),
      ),
    );
  }
}
