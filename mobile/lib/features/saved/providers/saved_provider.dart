import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../../home/models/error_code_model.dart';
import '../../home/providers/dashboard_provider.dart';

// Key for SharedPreferences
const String kSavedErrorsKey = 'saved_errors_ids';

// Notifier to manage list of saved IDs
class SavedIdsNotifier extends AsyncNotifier<List<String>> {
  @override
  Future<List<String>> build() async {
    return _loadSavedIds();
  }

  Future<List<String>> _loadSavedIds() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getStringList(kSavedErrorsKey) ?? [];
  }

  Future<void> toggle(String id) async {
    final prefs = await SharedPreferences.getInstance();
    final currentList = state.value ?? [];

    List<String> newList;
    if (currentList.contains(id)) {
      newList = currentList.where((item) => item != id).toList();
    } else {
      newList = [...currentList, id];
    }

    await prefs.setStringList(kSavedErrorsKey, newList);
    state = AsyncValue.data(newList);
  }

  bool isSaved(String id) {
    return state.value?.contains(id) ?? false;
  }
}

final savedIdsProvider = AsyncNotifierProvider<SavedIdsNotifier, List<String>>(
  SavedIdsNotifier.new,
);

// Provider to fetch ErrorCode objects based on saved IDs
final savedErrorsProvider = StreamProvider<List<ErrorCode>>((ref) {
  final savedIdsAsync = ref.watch(savedIdsProvider);
  final repository = ref.watch(dashboardRepositoryProvider);

  return savedIdsAsync.when(
    data: (ids) {
      if (ids.isEmpty) return Stream.value([]);
      return repository.getErrorsByIds(ids);
    },
    loading: () => Stream.value([]),
    error: (_, _) => Stream.value([]),
  );
});
