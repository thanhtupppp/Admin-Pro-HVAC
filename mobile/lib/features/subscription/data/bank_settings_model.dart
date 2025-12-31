class BankSettingsModel {
  final String id;
  final String bankId;
  final String bankName;
  final String accountNumber;
  final String accountName;
  final String template;
  final bool isActive;

  BankSettingsModel({
    required this.id,
    required this.bankId,
    required this.bankName,
    required this.accountNumber,
    required this.accountName,
    required this.template,
    required this.isActive,
  });

  factory BankSettingsModel.fromJson(Map<String, dynamic> json, String id) {
    return BankSettingsModel(
      id: id,
      bankId: json['bankId'] ?? 'MB',
      bankName: json['bankName'] ?? 'MB Bank',
      accountNumber:
          json['accountNumber'] ??
          '102874563321', // Fallback to provided default
      accountName: json['accountName'] ?? 'CONG TY CONG NGHE ADMIN PRO',
      template: json['template'] ?? 'compact2',
      isActive: json['isActive'] ?? true,
    );
  }
}
