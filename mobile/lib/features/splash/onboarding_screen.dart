import 'package:flutter/material.dart';
import 'package:gap/gap.dart';
import '../../core/constants/app_colors.dart';

class OnboardingScreen extends StatefulWidget {
  const OnboardingScreen({super.key});

  @override
  State<OnboardingScreen> createState() => _OnboardingScreenState();
}

class _OnboardingScreenState extends State<OnboardingScreen> {
  final PageController _controller = PageController();
  int _currentIndex = 0;

  final List<Map<String, String>> _steps = [
    {
      'image': 'https://s3-alpha-sig.figma.com/img/93b2/043c/6e6443ee9e54d3d-...', // Use placeholder or asset
      'title': 'Giải mã lỗi tức thì',
      'subtitle': 'Tra cứu nhanh mã lỗi cho hàng nghìn mẫu điều hòa, tủ lạnh và máy giặt.',
      'error_code': 'E4', // Special UI element
    },
    {
      'image': '...',
      'title': 'Sơ đồ mạch điện',
      'subtitle': 'Xem chi tiết sơ đồ mạch và vị trí linh kiện trực quan.',
      'error_code': '', 
    },
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: Column(
          children: [
            // Top Bar
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.end,
                children: [
                   TextButton(
                    onPressed: () {
                      // Skip action
                    }, 
                    child: const Text('Bỏ qua', style: TextStyle(color: AppColors.textSecondary, fontWeight: FontWeight.bold)),
                  ),
                ],
              ),
            ),

            // Page View
            Expanded(
              child: PageView.builder(
                controller: _controller,
                itemCount: _steps.length,
                onPageChanged: (index) => setState(() => _currentIndex = index),
                itemBuilder: (context, index) {
                  return _buildPageItem(_steps[index]);
                },
              ),
            ),

            // Bottom Controls
            Padding(
              padding: const EdgeInsets.all(24.0),
              child: Column(
                children: [
                  // Indicators
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: List.generate(3, (index) => Container(
                      margin: const EdgeInsets.symmetric(horizontal: 4),
                      width: index == _currentIndex ? 32 : 8,
                      height: 8,
                      decoration: BoxDecoration(
                        color: index == _currentIndex ? AppColors.primary : AppColors.surface,
                        borderRadius: BorderRadius.circular(4),
                      ),
                    )),
                  ),
                  const Gap(32),
                  // Next Button
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton(
                      onPressed: () {
                        if (_currentIndex < _steps.length - 1) {
                          _controller.nextPage(duration: const Duration(milliseconds: 300), curve: Curves.easeInOut);
                        } else {
                          // Go to Home/Login
                        }
                      },
                      child: const Text('Tiếp theo'),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildPageItem(Map<String, String> step) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 24),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          // Image Container
          Container(
            height: 320,
            width: double.infinity,
            decoration: BoxDecoration(
              color: const Color(0xFF141B2D),
              borderRadius: BorderRadius.circular(32),
              border: Border.all(color: AppColors.surface),
            ),
            child: Stack(
              alignment: Alignment.center,
              children: [
                // Background Effect
                // (Optional: Add actual image here)
                
                // Error Code Circle (if E4)
                if (step['error_code'] != '')
                  Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Container(
                        width: 64, height: 64,
                        decoration: const BoxDecoration(
                          color: AppColors.primary,
                          shape: BoxShape.circle,
                        ),
                        child: const Icon(Icons.priority_high, size: 32, color: Colors.white),
                      ),
                      const Gap(16),
                      Text(
                        step['error_code']!,
                        style: const TextStyle(fontSize: 48, fontWeight: FontWeight.bold, color: Colors.white),
                      )
                    ],
                  ),
              ],
            ),
          ),
          const Gap(48),
          Text(
            step['title']!,
            style: const TextStyle(fontSize: 28, fontWeight: FontWeight.bold, color: Colors.white),
            textAlign: TextAlign.center,
          ),
          const Gap(16),
          Text(
            step['subtitle']!,
            style: const TextStyle(fontSize: 16, color: AppColors.textSecondary, height: 1.5),
            textAlign: TextAlign.center,
          ),
        ],
      ),
    );
  }
}
