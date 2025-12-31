import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'plan_model.dart';

class PlanRepository {
  final FirebaseFirestore _firestore;

  PlanRepository(this._firestore);

  Future<List<PlanModel>> getPlans() async {
    try {
      final snapshot = await _firestore
          .collection('plans')
          .orderBy('price', descending: false)
          .get();

      return snapshot.docs
          .map((doc) {
            final data = doc.data();
            // ID is usually in doc.id, but let's check if data has id.
            // Our PlanModel expects id.
            data['id'] = doc.id;
            return PlanModel.fromJson(data);
          })
          .where((plan) => plan.status == 'active')
          .toList();
    } catch (e, stack) {
      // Return empty list or throw custom error
      // ignore: avoid_print
      print('Error fetching plans: $e');
      // ignore: avoid_print
      print(stack);
      return [];
    }
  }
}

final planRepositoryProvider = Provider<PlanRepository>((ref) {
  return PlanRepository(FirebaseFirestore.instance);
});

final plansProvider = FutureProvider<List<PlanModel>>((ref) async {
  final repo = ref.watch(planRepositoryProvider);
  return repo.getPlans();
});
