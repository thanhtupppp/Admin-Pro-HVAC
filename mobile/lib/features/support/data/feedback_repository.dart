import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'feedback_model.dart';
import '../../auth/providers/auth_provider.dart';

class FeedbackRepository {
  final FirebaseFirestore _firestore;

  FeedbackRepository(this._firestore);

  // Get user's tickets
  Stream<List<FeedbackModel>> getUserFeedbacks(String userId) {
    return _firestore
        .collection('feedbacks')
        .where('userId', isEqualTo: userId)
        .snapshots()
        .map((snapshot) {
          final list = snapshot.docs
              .map((doc) => FeedbackModel.fromJson(doc.data(), doc.id))
              .toList();
          list.sort((a, b) => b.createdAt.compareTo(a.createdAt));
          return list;
        });
  }

  // Create new ticket
  Future<void> createFeedback(FeedbackModel feedback) async {
    await _firestore.collection('feedbacks').add(feedback.toJson());
  }
}

final feedbackRepositoryProvider = Provider<FeedbackRepository>((ref) {
  return FeedbackRepository(FirebaseFirestore.instance);
});

final userFeedbacksProvider = StreamProvider<List<FeedbackModel>>((ref) {
  final authState = ref.watch(authProvider);
  final user = authState.user;

  if (user == null) return Stream.value([]);

  final repository = ref.watch(feedbackRepositoryProvider);
  return repository.getUserFeedbacks(user.uid);
});
