import 'package:cloud_firestore/cloud_firestore.dart';

class NotificationModel {
  final String id;
  final String type; // 'user', 'error', 'system', 'warning'
  final String title;
  final String message;
  final DateTime timestamp;
  final bool read;
  final String? icon;
  final String? activityId;

  NotificationModel({
    required this.id,
    required this.type,
    required this.title,
    required this.message,
    required this.timestamp,
    required this.read,
    this.icon,
    this.activityId,
  });

  factory NotificationModel.fromFirestore(DocumentSnapshot doc) {
    final data = doc.data() as Map<String, dynamic>;
    return NotificationModel(
      id: doc.id,
      type: data['type'] ?? 'system',
      title: data['title'] ?? '',
      message: data['message'] ?? '',
      timestamp: (data['timestamp'] is Timestamp)
          ? (data['timestamp'] as Timestamp).toDate()
          : DateTime.tryParse(data['timestamp'].toString()) ?? DateTime.now(),
      read: data['read'] ?? false,
      icon: data['icon'],
      activityId: data['activityId'],
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'type': type,
      'title': title,
      'message': message,
      'timestamp': Timestamp.fromDate(timestamp),
      'read': read,
      'icon': icon,
      'activityId': activityId,
    };
  }
}
