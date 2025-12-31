import 'package:flutter_riverpod/flutter_riverpod.dart';

// Provider quản lý index của Bottom Navigation Bar
final homeTabIndexProvider = NotifierProvider<HomeTabIndexNotifier, int>(
  HomeTabIndexNotifier.new,
);

class HomeTabIndexNotifier extends Notifier<int> {
  @override
  int build() => 0;

  void setIndex(int index) {
    state = index;
  }
}
