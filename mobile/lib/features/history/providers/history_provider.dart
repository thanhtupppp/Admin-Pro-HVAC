import 'dart:convert';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../../home/models/error_code_model.dart';
import '../../home/providers/dashboard_provider.dart';

const String kHistoryKey = 'search_history_v1';

class HistoryEntry {
  final String errorId;
  final DateTime timestamp;

  HistoryEntry({required this.errorId, required this.timestamp});

  Map<String, dynamic> toJson() => {
    'errorId': errorId,
    'timestamp': timestamp.toIso8601String(),
  };

  factory HistoryEntry.fromJson(Map<String, dynamic> json) {
    return HistoryEntry(
      errorId: json['errorId'],
      timestamp: DateTime.parse(json['timestamp']),
    );
  }
}

class HistoryDisplayItem {
  final HistoryEntry entry;
  final ErrorCode errorCode;

  HistoryDisplayItem({required this.entry, required this.errorCode});
}

class HistoryNotifier extends AsyncNotifier<List<HistoryEntry>> {
  @override
  Future<List<HistoryEntry>> build() async {
    return _loadHistory();
  }

  Future<List<HistoryEntry>> _loadHistory() async {
    final prefs = await SharedPreferences.getInstance();
    final List<String> jsonList = prefs.getStringList(kHistoryKey) ?? [];
    try {
      return jsonList.map((e) => HistoryEntry.fromJson(jsonDecode(e))).toList();
    } catch (e) {
      return [];
    }
  }

  Future<void> addToHistory(String errorId) async {
    final prefs = await SharedPreferences.getInstance();
    final currentList = state.value ?? await _loadHistory();

    // Remove if exists to move to top (prevent duplicates)
    final filtered = currentList.where((e) => e.errorId != errorId).toList();

    // Add to top
    final newEntry = HistoryEntry(errorId: errorId, timestamp: DateTime.now());
    final newList = [newEntry, ...filtered];

    // Limit to 50 items
    if (newList.length > 50) {
      newList.removeLast();
    }

    await prefs.setStringList(
      kHistoryKey,
      newList.map((e) => jsonEncode(e.toJson())).toList(),
    );

    state = AsyncValue.data(newList);
  }

  Future<void> removeItem(String errorId) async {
    final prefs = await SharedPreferences.getInstance();
    final currentList = state.value ?? await _loadHistory();
    final newList = currentList.where((e) => e.errorId != errorId).toList();

    await prefs.setStringList(
      kHistoryKey,
      newList.map((e) => jsonEncode(e.toJson())).toList(),
    );
    state = AsyncValue.data(newList);
  }

  Future<void> clearHistory() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(kHistoryKey);
    state = const AsyncValue.data([]);
  }
}

final historyNotifierProvider =
    AsyncNotifierProvider<HistoryNotifier, List<HistoryEntry>>(
      HistoryNotifier.new,
    );

// This provider combines the history IDs/timestamps with the actual ErrorCode data from Firestore
final historyItemsProvider = StreamProvider<List<HistoryDisplayItem>>((ref) {
  final historyEntriesAsync = ref.watch(historyNotifierProvider);
  final repository = ref.watch(dashboardRepositoryProvider);

  return historyEntriesAsync.when(
    data: (entries) {
      if (entries.isEmpty) return Stream.value([]);

      final ids = entries.map((e) => e.errorId).toList();

      return repository.getErrorsByIds(ids).map((errorCodes) {
        final errorMap = {for (var e in errorCodes) e.id: e};

        final List<HistoryDisplayItem> displayItems = [];

        for (var entry in entries) {
          final error = errorMap[entry.errorId];
          if (error != null) {
            displayItems.add(
              HistoryDisplayItem(entry: entry, errorCode: error),
            );
          }
        }
        return displayItems;
      });
    },
    loading: () => Stream.value([]),
    error: (_, _) => Stream.value([]),
  );
});
