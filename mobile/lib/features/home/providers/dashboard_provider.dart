import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import '../repositories/dashboard_repository.dart';
import '../models/error_code_model.dart';
import '../models/brand_model.dart';

final dashboardRepositoryProvider = Provider(
  (ref) => DashboardRepository(FirebaseFirestore.instance),
);

// Provider cho danh sách brands
final brandsProvider = StreamProvider<List<Brand>>((ref) {
  final repository = ref.watch(dashboardRepositoryProvider);
  return repository.getBrands();
});

// Notifier cho brand đang được chọn (null = Tất cả)
class SelectedBrandNotifier extends Notifier<String?> {
  @override
  String? build() => null;

  void select(String? brand) {
    state = brand;
  }
}

final selectedBrandProvider = NotifierProvider<SelectedBrandNotifier, String?>(
  SelectedBrandNotifier.new,
);

// Provider cho lỗi gần đây (có filter theo brand)
final recentErrorsProvider = StreamProvider<List<ErrorCode>>((ref) {
  final repository = ref.watch(dashboardRepositoryProvider);
  final selectedBrand = ref.watch(selectedBrandProvider);

  if (selectedBrand == null || selectedBrand.isEmpty) {
    return repository.getRecentErrors();
  } else {
    return repository.getRecentErrorsByBrand(selectedBrand);
  }
});

// Provider cho lỗi thường gặp (có filter theo brand)
final commonErrorsProvider = StreamProvider<List<ErrorCode>>((ref) {
  final repository = ref.watch(dashboardRepositoryProvider);
  final selectedBrand = ref.watch(selectedBrandProvider);

  if (selectedBrand == null || selectedBrand.isEmpty) {
    return repository.getCommonErrors();
  } else {
    return repository.getCommonErrorsByBrand(selectedBrand);
  }
});
