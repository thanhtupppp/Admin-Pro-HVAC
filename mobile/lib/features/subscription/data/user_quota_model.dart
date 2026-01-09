import 'package:cloud_firestore/cloud_firestore.dart';

class UserQuota {
  final String userId;
  final String date; // YYYY-MM-DD format
  final int errorSearchesUsed;
  final int errorSearchesLimit;
  final int adRewardsEarned;

  UserQuota({
    required this.userId,
    required this.date,
    required this.errorSearchesUsed,
    required this.errorSearchesLimit,
    required this.adRewardsEarned,
  });

  /// Total quota available (base + rewards)
  int get totalLimit => errorSearchesLimit + adRewardsEarned;

  /// Remaining quota
  int get remaining => totalLimit - errorSearchesUsed;

  /// Has quota left?
  bool get hasQuota => errorSearchesUsed < totalLimit;

  /// Can watch ad for reward?
  bool get canWatchAd => !hasQuota && adRewardsEarned < 10; // Max 10 ads/day

  factory UserQuota.fromFirestore(
    DocumentSnapshot? doc,
    String userId,
    String date,
    int defaultLimit,
  ) {
    if (doc == null || !doc.exists) {
      // Return fresh quota for today
      return UserQuota(
        userId: userId,
        date: date,
        errorSearchesUsed: 0,
        errorSearchesLimit: defaultLimit,
        adRewardsEarned: 0,
      );
    }

    final data = doc.data() as Map<String, dynamic>;
    return UserQuota(
      userId: userId,
      date: data['date'] ?? date,
      errorSearchesUsed: data['errorSearchesUsed']?.toInt() ?? 0,
      errorSearchesLimit: data['errorSearchesLimit']?.toInt() ?? defaultLimit,
      adRewardsEarned: data['adRewardsEarned']?.toInt() ?? 0,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'date': date,
      'errorSearchesUsed': errorSearchesUsed,
      'errorSearchesLimit': errorSearchesLimit,
      'adRewardsEarned': adRewardsEarned,
      'updatedAt': FieldValue.serverTimestamp(),
    };
  }

  @override
  String toString() {
    return 'UserQuota(date: $date, used: $errorSearchesUsed, limit: $errorSearchesLimit, rewards: $adRewardsEarned, remaining: $remaining)';
  }
}
