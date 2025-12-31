import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import '../repositories/dashboard_repository.dart';
import '../models/error_code_model.dart';

final dashboardRepositoryProvider = Provider(
  (ref) => DashboardRepository(FirebaseFirestore.instance),
);

final recentErrorsProvider = StreamProvider<List<ErrorCode>>((ref) {
  final repository = ref.watch(dashboardRepositoryProvider);
  return repository.getRecentErrors();
});

final commonErrorsProvider = StreamProvider<List<ErrorCode>>((ref) {
  final repository = ref.watch(dashboardRepositoryProvider);
  return repository.getCommonErrors();
});
