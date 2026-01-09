import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:flutter/foundation.dart';
import 'plan_model.dart';

class PlanRepository {
  final FirebaseFirestore _firestore;

  PlanRepository({FirebaseFirestore? firestore})
    : _firestore = firestore ?? FirebaseFirestore.instance;

  /// Get all available plans
  Future<List<PlanModel>> getAllPlans() async {
    try {
      final snapshot = await _firestore
          .collection('servicePlans')
          .where('status', isEqualTo: 'active')
          .get();

      return snapshot.docs.map((doc) {
        final data = doc.data();
        return PlanModel.fromJson({...data, 'id': doc.id});
      }).toList();
    } catch (e) {
      debugPrint('❌ Error fetching plans: $e');
      return [];
    }
  }

  /// Get a specific plan by ID
  Future<PlanModel?> getPlanById(String planId) async {
    try {
      final doc = await _firestore.collection('servicePlans').doc(planId).get();

      if (!doc.exists) {
        debugPrint('⚠️ Plan not found: $planId');
        return null;
      }

      final data = doc.data()!;
      return PlanModel.fromJson({...data, 'id': doc.id});
    } catch (e) {
      debugPrint('❌ Error fetching plan $planId: $e');
      return null;
    }
  }

  /// Get user's current plan
  Future<PlanModel?> getUserPlan(String userId) async {
    try {
      // Get user document
      final userDoc = await _firestore.collection('users').doc(userId).get();

      if (!userDoc.exists) {
        debugPrint('⚠️ User not found: $userId');
        return null;
      }

      final userData = userDoc.data()!;
      final planId = userData['plan'] as String? ?? 'free';

      // Fetch the plan
      return await getPlanById(planId);
    } catch (e) {
      debugPrint('❌ Error fetching user plan: $e');
      return null;
    }
  }

  /// Update user's plan
  Future<void> updateUserPlan(String userId, String planId) async {
    try {
      await _firestore.collection('users').doc(userId).update({
        'plan': planId,
        'planUpdatedAt': FieldValue.serverTimestamp(),
      });
      debugPrint('✅ Updated user plan to: $planId');
    } catch (e) {
      debugPrint('❌ Error updating user plan: $e');
      rethrow;
    }
  }

  /// Stream all plans (for real-time updates)
  Stream<List<PlanModel>> watchAllPlans() {
    return _firestore
        .collection('servicePlans')
        .where('status', isEqualTo: 'active')
        .snapshots()
        .map((snapshot) {
          return snapshot.docs.map((doc) {
            final data = doc.data();
            return PlanModel.fromJson({...data, 'id': doc.id});
          }).toList();
        });
  }

  /// Stream user's plan (for real-time updates)
  Stream<PlanModel?> watchUserPlan(String userId) {
    return _firestore.collection('users').doc(userId).snapshots().asyncMap((
      userDoc,
    ) async {
      if (!userDoc.exists) return null;

      final userData = userDoc.data()!;
      final planId = userData['plan'] as String? ?? 'free';

      return await getPlanById(planId);
    });
  }

  /// Get Free plan (fallback)
  Future<PlanModel?> getFreePlan() async {
    return await getPlanById('free');
  }
}
