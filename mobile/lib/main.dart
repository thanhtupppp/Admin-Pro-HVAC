import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'core/config/firebase_options.dart';
import 'core/services/onboarding_service.dart';
import 'core/theme/app_theme.dart';
import 'features/splash/welcome_screen.dart';
import 'features/splash/onboarding_screen.dart';
import 'features/auth/login_screen.dart';
import 'features/auth/signup_screen.dart';
import 'features/auth/forgot_password_screen.dart';
import 'features/home/dashboard_tab.dart';
import 'features/profile/edit_profile_screen.dart';
import 'features/profile/user_info_screen.dart';
import 'features/search/search_screen.dart';
import 'features/profile/change_password_screen.dart';
import 'features/notification/notification_screen.dart';
import 'features/layout/main_wrapper.dart';
import 'features/saved/saved_screen.dart';
import 'features/history/history_screen.dart';
import 'features/profile/profile_screen.dart';
import 'features/error_detail/error_detail_screen.dart';
import 'features/troubleshoot/troubleshoot_screen.dart';
import 'features/home/models/error_code_model.dart';
import 'features/subscription/presentation/subscription_screen.dart';
import 'features/subscription/presentation/payment_screen.dart';
import 'features/subscription/presentation/transaction_history_screen.dart';
import 'features/subscription/data/plan_model.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await Firebase.initializeApp(options: DefaultFirebaseOptions.currentPlatform);
  runApp(const ProviderScope(child: MyApp()));
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp.router(
      title: 'HVAC Pro Checker',
      theme: AppTheme.darkTheme,
      debugShowCheckedModeBanner: false,
      routerConfig: _router,
    );
  }
}

final _rootNavigatorKey = GlobalKey<NavigatorState>();
final _shellNavigatorHomeKey = GlobalKey<NavigatorState>(
  debugLabel: 'shellHome',
);
final _shellNavigatorSearchKey = GlobalKey<NavigatorState>(
  debugLabel: 'shellSearch',
);
final _shellNavigatorSavedKey = GlobalKey<NavigatorState>(
  debugLabel: 'shellSaved',
);
final _shellNavigatorHistoryKey = GlobalKey<NavigatorState>(
  debugLabel: 'shellHistory',
);
final _shellNavigatorSettingsKey = GlobalKey<NavigatorState>(
  debugLabel: 'shellSettings',
);

final _router = GoRouter(
  navigatorKey: _rootNavigatorKey,
  initialLocation: '/',
  redirect: (context, state) async {
    final onboardingService = OnboardingService();
    final isFirstTime = await onboardingService.isFirstTime();
    final currentUser = FirebaseAuth.instance.currentUser;

    final isOnWelcome = state.matchedLocation == '/';
    final isOnOnboarding = state.matchedLocation == '/onboarding';
    final isOnAuth =
        state.matchedLocation == '/login' ||
        state.matchedLocation == '/signup' ||
        state.matchedLocation == '/forgot-password';

    if (isFirstTime) {
      if (!isOnWelcome && !isOnOnboarding) return '/';
      return null;
    }

    if (currentUser == null) {
      if (!isOnAuth) return '/login';
      return null;
    }

    if (isOnAuth ||
        isOnWelcome ||
        isOnOnboarding ||
        state.matchedLocation == '/') {
      return '/home';
    }

    return null;
  },
  routes: [
    GoRoute(path: '/', builder: (context, state) => const WelcomeScreen()),
    GoRoute(
      path: '/onboarding',
      builder: (context, state) => const OnboardingScreen(),
    ),
    GoRoute(path: '/login', builder: (context, state) => const LoginScreen()),
    GoRoute(path: '/signup', builder: (context, state) => const SignupScreen()),
    GoRoute(
      path: '/forgot-password',
      builder: (context, state) => const ForgotPasswordScreen(),
    ),

    // Stateful Nested Shell
    StatefulShellRoute.indexedStack(
      builder: (context, state, navigationShell) {
        return MainWrapper(navigationShell: navigationShell);
      },
      branches: [
        // Tab 1: Home
        StatefulShellBranch(
          navigatorKey: _shellNavigatorHomeKey,
          routes: [
            GoRoute(
              path: '/home',
              builder: (context, state) => const DashboardTab(),
              routes: [
                GoRoute(
                  path: 'notifications',
                  builder: (context, state) => const NotificationScreen(),
                ),
                GoRoute(
                  path: 'error-detail',
                  builder: (context, state) {
                    final error = state.extra as ErrorCode;
                    return ErrorDetailScreen(errorCode: error);
                  },
                  routes: [
                    GoRoute(
                      path: 'troubleshoot',
                      builder: (context, state) => const TroubleshootScreen(),
                    ),
                  ],
                ),
              ],
            ),
          ],
        ),
        // Tab 2: Search
        StatefulShellBranch(
          navigatorKey: _shellNavigatorSearchKey,
          routes: [
            GoRoute(
              path: '/search-lookup',
              builder: (context, state) => const SearchScreen(),
              routes: [
                GoRoute(
                  path: 'error-detail',
                  builder: (context, state) {
                    final error = state.extra as ErrorCode;
                    return ErrorDetailScreen(errorCode: error);
                  },
                  routes: [
                    GoRoute(
                      path: 'troubleshoot',
                      builder: (context, state) => const TroubleshootScreen(),
                    ),
                  ],
                ),
              ],
            ),
          ],
        ),
        // Tab 3: Saved
        StatefulShellBranch(
          navigatorKey: _shellNavigatorSavedKey,
          routes: [
            GoRoute(
              path: '/saved',
              builder: (context, state) => const SavedScreen(),
              routes: [
                GoRoute(
                  path: 'error-detail',
                  builder: (context, state) {
                    final error = state.extra as ErrorCode;
                    return ErrorDetailScreen(errorCode: error);
                  },
                  routes: [
                    GoRoute(
                      path: 'troubleshoot',
                      builder: (context, state) => const TroubleshootScreen(),
                    ),
                  ],
                ),
              ],
            ),
          ],
        ),
        // Tab 4: History
        StatefulShellBranch(
          navigatorKey: _shellNavigatorHistoryKey,
          routes: [
            GoRoute(
              path: '/history',
              builder: (context, state) => const HistoryScreen(),
              routes: [
                GoRoute(
                  path: 'error-detail',
                  builder: (context, state) {
                    final error = state.extra as ErrorCode;
                    return ErrorDetailScreen(errorCode: error);
                  },
                  routes: [
                    GoRoute(
                      path: 'troubleshoot',
                      builder: (context, state) => const TroubleshootScreen(),
                    ),
                  ],
                ),
              ],
            ),
          ],
        ),
        // Tab 5: Settings
        StatefulShellBranch(
          navigatorKey: _shellNavigatorSettingsKey,
          routes: [
            GoRoute(
              path: '/settings',
              builder: (context, state) => const ProfileScreen(),
              routes: [
                GoRoute(
                  path: 'edit-profile',
                  builder: (context, state) => const EditProfileScreen(),
                ),
                GoRoute(
                  path: 'user-info',
                  builder: (context, state) => const UserInfoScreen(),
                ),
                GoRoute(
                  path: 'change-password',
                  builder: (context, state) => const ChangePasswordScreen(),
                ),
                GoRoute(
                  path: 'transactions',
                  builder: (context, state) => const TransactionHistoryScreen(),
                ),
                GoRoute(
                  path: 'subscription',
                  builder: (context, state) => const SubscriptionScreen(),
                  routes: [
                    GoRoute(
                      name: 'payment',
                      path: 'payment',
                      builder: (context, state) =>
                          PaymentScreen(plan: state.extra as PlanModel),
                    ),
                  ],
                ),
              ],
            ),
          ],
        ),
      ],
    ),
  ],
);
