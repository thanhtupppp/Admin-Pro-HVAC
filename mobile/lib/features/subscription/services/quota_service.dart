import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:flutter/foundation.dart';
import 'package:intl/intl.dart';
import '../data/user_quota_model.dart';

class QuotaService {
  final FirebaseFirestore _firestore;
  final String userId;
  final int dailyLimit;

  QuotaService({
    required this.userId,
    required this.dailyLimit,
    FirebaseFirestore? firestore,
  }) : _firestore = firestore ?? FirebaseFirestore.instance;

  /// Get today's date in YYYY-MM-DD format
  String get _today => DateFormat('yyyy-MM-dd').format(DateTime.now());

  /// Reference to today's quota document
  DocumentReference get _todayQuotaRef {
    return _firestore
        .collection('users')
        .doc(userId)
        .collection('quotas')
        .doc(_today);
  }

  /// Get today's quota
  Future<UserQuota> getTodayQuota() async {
    try {
      final doc = await _todayQuotaRef.get();
      return UserQuota.fromFirestore(doc, userId, _today, dailyLimit);
    } catch (e) {
      debugPrint('❌ Error getting quota: $e');
      return UserQuota(
        userId: userId,
        date: _today,
        errorSearchesUsed: 0,
        errorSearchesLimit: dailyLimit,
        adRewardsEarned: 0,
      );
    }
  }

  /// Check if user can search error
  Future<bool> canSearchError() async {
    final quota = await getTodayQuota();
    return quota.hasQuota;
  }

  /// Consume 1 error search quota
  Future<void> consumeErrorSearch() async {
    try {
      await _todayQuotaRef.set({
        'date': _today,
        'errorSearchesUsed': FieldValue.increment(1),
        'errorSearchesLimit': dailyLimit,
        'updatedAt': FieldValue.serverTimestamp(),
      }, SetOptions(merge: true));

      debugPrint('✅ Consumed 1 quota. Today: $_today');
    } catch (e) {
      debugPrint('❌ Error consuming quota: $e');
    }
  }

  /// Reward from ad (called after successful ad watch)
  Future<void> rewardFromAd() async {
    try {
      await _todayQuotaRef.set({
        'date': _today,
        'adRewardsEarned': FieldValue.increment(1),
        'updatedAt': FieldValue.serverTimestamp(),
      }, SetOptions(merge: true));

      debugPrint('✅ +1 quota from ad. Today: $_today');
    } catch (e) {
      debugPrint('❌ Error rewarding from ad: $e');
    }
  }

  /// Stream today's quota (for real-time updates)
  Stream<UserQuota> watchTodayQuota() {
    return _todayQuotaRef.snapshots().map((doc) {
      return UserQuota.fromFirestore(doc, userId, _today, dailyLimit);
    });
  }

  /// Clean up old quotas (optional, for maintenance)
  Future<void> cleanupOldQuotas({int keepDays = 30}) async {
    try {
      final cutoffDate = DateTime.now().subtract(Duration(days: keepDays));
      final cutoffStr = DateFormat('yyyy-MM-dd').format(cutoffDate);

      final oldQuotas = await _firestore
          .collection('users')
          .doc(userId)
          .collection('quotas')
          .where('date', isLessThan: cutoffStr)
          .get();

      for (var doc in oldQuotas.docs) {
        await doc.reference.delete();
      }

      debugPrint('🧹 Cleaned up ${oldQuotas.docs.length} old quota records');
    } catch (e) {
      debugPrint('❌ Error cleaning up quotas: $e');
    }
  }
}
