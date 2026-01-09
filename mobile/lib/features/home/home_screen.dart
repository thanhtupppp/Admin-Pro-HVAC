import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../core/constants/app_colors.dart';
// import '../auth/providers/auth_provider.dart'; // No longer needed directly here
import 'dashboard_tab.dart';
import '../profile/profile_screen.dart'; // Import ProfileScreen
import 'providers/home_provider.dart'; // Import HomeProvider
import '../search/search_screen.dart';
import '../saved/saved_screen.dart';
import '../history/history_screen.dart';

class HomeScreen extends ConsumerWidget {
  // Change to ConsumerWidget
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final currentIndex = ref.watch(homeTabIndexProvider);

    final List<Widget> screens = [
      const DashboardTab(), // 1. Trang chủ
      const SearchScreen(), // 2. Tìm kiếm
      const SavedScreen(), // 3. Đã lưu
      const HistoryScreen(), // 4. Lịch sử
      const ProfileScreen(), // 5. Cài đặt (Profile)
    ];

    return Scaffold(
      backgroundColor: AppColors.background,
      body: screens[currentIndex],
      bottomNavigationBar: NavigationBar(
        selectedIndex: currentIndex,
        onDestinationSelected: (index) {
          ref.read(homeTabIndexProvider.notifier).setIndex(index);
        },
        destinations: const [
          NavigationDestination(
            icon: Icon(Icons.home_outlined),
            selectedIcon: Icon(Icons.home),
            label: 'Trang chủ',
          ),
          NavigationDestination(
            icon: Icon(Icons.search_outlined),
            selectedIcon: Icon(Icons.search),
            label: 'Tìm kiếm',
          ),
          NavigationDestination(
            icon: Icon(Icons.bookmark_outline),
            selectedIcon: Icon(Icons.bookmark),
            label: 'Đã lưu',
          ),
          NavigationDestination(
            icon: Icon(Icons.history_outlined),
            selectedIcon: Icon(Icons.history),
            label: 'Lịch sử',
          ),
          NavigationDestination(
            icon: Icon(Icons.settings_outlined),
            selectedIcon: Icon(Icons.settings),
            label: 'Cài đặt',
          ),
        ],
      ),
    );
  }
}
