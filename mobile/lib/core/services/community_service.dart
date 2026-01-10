import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';

class CommunityMessage {
  final String id;
  final String text;
  final String userId;
  final String userEmail;
  final String? userAvatar; // Optional
  final DateTime timestamp;

  CommunityMessage({
    required this.id,
    required this.text,
    required this.userId,
    required this.userEmail,
    this.userAvatar,
    required this.timestamp,
  });

  factory CommunityMessage.fromFirestore(DocumentSnapshot doc) {
    final data = doc.data() as Map<String, dynamic>;
    return CommunityMessage(
      id: doc.id,
      text: data['text'] ?? '',
      userId: data['userId'] ?? '',
      userEmail: data['userEmail'] ?? 'Anonymous',
      userAvatar: data['userAvatar'],
      timestamp: (data['timestamp'] as Timestamp?)?.toDate() ?? DateTime.now(),
    );
  }
}

class CommunityService {
  final FirebaseFirestore _firestore = FirebaseFirestore.instance;
  final FirebaseAuth _auth = FirebaseAuth.instance;

  // Stream of messages ordered by time (descending usually for chat apps logic, but UI might reverse)
  // We'll order by DESC so newest is at top if we reverse ListView,
  // OR ASC if we auto-scroll to bottom.
  // Let's use DESC (newest first) and reverse the ListView, standard Flutter pattern.
  Stream<List<CommunityMessage>> getMessagesStream() {
    return _firestore
        .collection('community_messages')
        .orderBy('timestamp', descending: true)
        .limit(100) // Load last 100 messages
        .snapshots()
        .map((snapshot) {
          return snapshot.docs
              .map((doc) => CommunityMessage.fromFirestore(doc))
              .toList();
        });
  }

  Future<void> sendMessage(String text) async {
    final user = _auth.currentUser;
    if (user == null) throw Exception('User must be logged in');

    if (text.trim().isEmpty) return;

    await _firestore.collection('community_messages').add({
      'text': text.trim(),
      'userId': user.uid,
      'userEmail': user.email ?? 'Unknown',
      'userAvatar': user.photoURL,
      'timestamp': FieldValue.serverTimestamp(),
    });
  }
}
