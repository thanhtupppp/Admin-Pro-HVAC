class TransactionModel {
  final String id;
  final String userId;
  final String userEmail;
  final String planId;
  final String planName;
  final double amount;
  final String status; // 'pending', 'completed', 'failed', 'rejected'
  final String paymentMethod; // 'vietqr', 'momo', 'banking'
  final DateTime createdAt;
  final DateTime updatedAt;
  final String? couponCode;

  TransactionModel({
    required this.id,
    required this.userId,
    required this.userEmail,
    required this.planId,
    required this.planName,
    required this.amount,
    required this.status,
    required this.paymentMethod,
    required this.createdAt,
    required this.updatedAt,
    this.couponCode,
  });

  Map<String, dynamic> toJson() {
    return {
      'userId': userId,
      'userEmail': userEmail,
      'planId': planId,
      'planName': planName,
      'amount': amount,
      'status': status,
      'paymentMethod': paymentMethod,
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt.toIso8601String(),
      'couponCode': couponCode,
    };
  }

  factory TransactionModel.fromJson(Map<String, dynamic> json, String id) {
    return TransactionModel(
      id: id,
      userId: json['userId'] ?? '',
      userEmail: json['userEmail'] ?? '',
      planId: json['planId'] ?? '',
      planName: json['planName'] ?? '',
      amount: (json['amount'] ?? 0).toDouble(),
      status: json['status'] ?? 'pending',
      paymentMethod: json['paymentMethod'] ?? 'banking',
      createdAt: DateTime.parse(
        json['createdAt'] ?? DateTime.now().toIso8601String(),
      ),
      updatedAt: DateTime.parse(
        json['updatedAt'] ?? DateTime.now().toIso8601String(),
      ),
      couponCode: json['couponCode'],
    );
  }
}
