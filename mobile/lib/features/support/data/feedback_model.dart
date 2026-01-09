class FeedbackModel {
  final String id;
  final String userId;
  final String userEmail;
  final String userName;
  final String type; // 'general', 'bug', 'feature_request', 'account'
  final String title;
  final String content;
  final List<String> images;
  final String status; // 'pending', 'processing', 'resolved', 'closed'
  final String? adminReply;
  final DateTime? repliedAt;
  final String? replyBy;
  final DateTime createdAt;
  final DateTime updatedAt;

  FeedbackModel({
    required this.id,
    required this.userId,
    required this.userEmail,
    required this.userName,
    required this.type,
    required this.title,
    required this.content,
    this.images = const [],
    required this.status,
    this.adminReply,
    this.repliedAt,
    this.replyBy,
    required this.createdAt,
    required this.updatedAt,
  });

  Map<String, dynamic> toJson() {
    return {
      'userId': userId,
      'userEmail': userEmail,
      'userName': userName,
      'type': type,
      'title': title,
      'content': content,
      'images': images,
      'status': status,
      'adminReply': adminReply,
      'repliedAt': repliedAt?.toIso8601String(),
      'replyBy': replyBy,
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt.toIso8601String(),
    };
  }

  factory FeedbackModel.fromJson(Map<String, dynamic> json, String id) {
    return FeedbackModel(
      id: id,
      userId: json['userId'] ?? '',
      userEmail: json['userEmail'] ?? '',
      userName: json['userName'] ?? '',
      type: json['type'] ?? 'general',
      title: json['title'] ?? '',
      content: json['content'] ?? '',
      images: List<String>.from(json['images'] ?? []),
      status: json['status'] ?? 'pending',
      adminReply: json['adminReply'],
      repliedAt: json['repliedAt'] != null
          ? DateTime.parse(json['repliedAt'])
          : null,
      replyBy: json['replyBy'],
      createdAt: DateTime.parse(
        json['createdAt'] ?? DateTime.now().toIso8601String(),
      ),
      updatedAt: DateTime.parse(
        json['updatedAt'] ?? DateTime.now().toIso8601String(),
      ),
    );
  }
}
