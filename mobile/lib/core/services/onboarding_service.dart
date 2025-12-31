import 'package:shared_preferences/shared_preferences.dart';

class OnboardingService {
  static const String _keyFirstTime = 'is_first_time';

  /// Check if this is the first time opening the app
  Future<bool> isFirstTime() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getBool(_keyFirstTime) ?? true;
  }

  /// Mark onboarding as completed
  Future<void> completeOnboarding() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool(_keyFirstTime, false);
  }

  /// Reset (for testing purposes)
  Future<void> reset() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(_keyFirstTime);
  }
}
