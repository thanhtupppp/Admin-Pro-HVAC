import 'package:shared_preferences/shared_preferences.dart';

class SearchHistoryRepository {
  static const String _kHistoryKey = 'search_history';
  static const int _kMaxHistorySize = 10;

  Future<List<String>> getHistory() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getStringList(_kHistoryKey) ?? [];
  }

  Future<void> addQuery(String query) async {
    if (query.trim().isEmpty) return;

    final prefs = await SharedPreferences.getInstance();
    final List<String> currentHistory = prefs.getStringList(_kHistoryKey) ?? [];

    // Remove if exists to move to top
    currentHistory.remove(query.trim());

    // Add to front
    currentHistory.insert(0, query.trim());

    // Limit size
    if (currentHistory.length > _kMaxHistorySize) {
      currentHistory.removeLast();
    }

    await prefs.setStringList(_kHistoryKey, currentHistory);
  }

  Future<void> removeQuery(String query) async {
    final prefs = await SharedPreferences.getInstance();
    final List<String> currentHistory = prefs.getStringList(_kHistoryKey) ?? [];

    currentHistory.remove(query);
    await prefs.setStringList(_kHistoryKey, currentHistory);
  }

  Future<void> clearHistory() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(_kHistoryKey);
  }
}
