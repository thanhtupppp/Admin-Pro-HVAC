import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'plan_model.dart';

class PlanRepository {
  final FirebaseFirestore _firestore;

  PlanRepository(this._firestore);

  Future<List<PlanModel>> getPlans() async {
    try {
      final snapshot = await _firestore
          .collection('servicePlans') // Updated collection name
          .where('status', isEqualTo: 'active')
          .get();

      final plans = snapshot.docs.map((doc) {
        final data = doc.data();
        data['id'] = doc.id;
        return PlanModel.fromJson(data);
      }).toList();

      // Sort in memory to avoid index requirement
      plans.sort((a, b) => a.price.compareTo(b.price));

      return plans;
    } catch (e, stack) {
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
