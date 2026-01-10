import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../core/constants/app_colors.dart';

import '../../core/services/security_service.dart';
import '../auth/providers/auth_provider.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

class MainWrapper extends ConsumerStatefulWidget {
  final StatefulNavigationShell navigationShell;

  const MainWrapper({super.key, required this.navigationShell});

  @override
  ConsumerState<MainWrapper> createState() => _MainWrapperState();
}

class _MainWrapperState extends ConsumerState<MainWrapper> {
  @override
  void initState() {
    super.initState();
    // Enforce security permissions on startup
    WidgetsBinding.instance.addPostFrameCallback((_) {
      SecurityService().enforceSecurity(context);
      _checkLockedStatus();
    });
  }

  Future<void> _checkLockedStatus() async {
    final authState = ref.read(authProvider);
    final isLocallyLocked = await SecurityService().isLocallyLocked;
    final isLockSynced = await SecurityService().isLockSynced;

    // 1. Server says locked -> Go Locked (Authority)
    if (authState.userData?['status'] == 'locked') {
      if (mounted) context.go('/locked');
      return;
    }

    // 2. Local says locked but Server is Active
    if (isLocallyLocked && authState.userData?['status'] == 'active') {
      if (isLockSynced) {
        // Case A: Lock WAS synced, but now Server is Active.
        // Means Admin unlocked it manually. TRUST SERVER -> UNLOCK LOCAL.
        debugPrint(
          '🔓 Server is active & lock was synced. Clearing local lock (Admin Action).',
        );
        await SecurityService().unlockLocal();
      } else {
        // Case B: Lock was NOT synced (Offline lock).
        // Means Server doesn't know. RETRY LOCK.
        debugPrint('🔒 Syncing offline local lock to server...');
        await SecurityService().syncLockState();
        if (mounted) context.go('/locked');
      }
      return;
    }
  }

  void _goBranch(int index) {
    widget.navigationShell.goBranch(
      index,
      initialLocation: index == widget.navigationShell.currentIndex,
    );
  }

  @override
  Widget build(BuildContext context) {
    // Listen for status changes (e.g. real-time lock from admin)
    ref.listen(authProvider, (previous, next) {
      if (next.userData?['status'] == 'locked') {
        context.go('/locked');
      } else if (previous?.userData?['status'] == 'locked' &&
          next.userData?['status'] == 'active') {
        // Only unlock if explicit transition from LOCKED to ACTIVE
        SecurityService().unlockLocal();
      }
    });

    return Scaffold(
      backgroundColor: AppColors.background,
      body: widget.navigationShell,
      bottomNavigationBar: Theme(
        data: Theme.of(context).copyWith(
          splashColor: Colors.transparent,
          highlightColor: Colors.transparent,
        ),
        child: NavigationBarTheme(
          data: NavigationBarThemeData(
            backgroundColor: const Color(0xFF101822), // Dark bg matching design
            indicatorColor: Colors.transparent,
            elevation: 0,
            labelTextStyle: WidgetStateProperty.resolveWith((states) {
              if (states.contains(WidgetState.selected)) {
                return const TextStyle(
                  color: AppColors.primary,
                  fontSize: 12,
                  fontWeight: FontWeight.bold,
                );
              }
              return const TextStyle(
                color: Color(0xFF94A3B8), // Slate 400
                fontSize: 12,
                fontWeight: FontWeight.w500,
              );
            }),
            iconTheme: WidgetStateProperty.resolveWith((states) {
              if (states.contains(WidgetState.selected)) {
                return const IconThemeData(color: AppColors.primary, size: 24);
              }
              return const IconThemeData(
                color: Color(0xFF94A3B8), // Slate 400
                size: 24,
              );
            }),
          ),
          child: NavigationBar(
            selectedIndex: widget.navigationShell.currentIndex,
            onDestinationSelected: _goBranch,
            destinations: const [
              NavigationDestination(
                icon: Icon(Icons.home_outlined),
                selectedIcon: Icon(Icons.home),
                label: 'Trang chủ',
              ),
              NavigationDestination(
                icon: Icon(Icons.search),
                selectedIcon: Icon(Icons.search),
                label: 'Tìm kiếm',
              ),
              NavigationDestination(
                icon: Icon(Icons.bookmark_outline),
                selectedIcon: Icon(Icons.bookmark),
                label: 'Đã lưu',
              ),
              NavigationDestination(
                icon: Icon(Icons.history),
                selectedIcon: Icon(Icons.history), // Or nice history icon
                label: 'Lịch sử',
              ),
              NavigationDestination(
                icon: Icon(Icons.settings_outlined),
                selectedIcon: Icon(Icons.settings),
                label: 'Cài đặt',
              ),
            ],
          ),
        ),
      ),
    );
  }
}
