class PlanLimits {
  final int maxUsers;
  final int maxErrorCodes;
  final int aiQuota;

  PlanLimits({this.maxUsers = 1, this.maxErrorCodes = 10, this.aiQuota = 1000});

  factory PlanLimits.fromJson(Map<String, dynamic> json) {
    return PlanLimits(
      maxUsers: json['maxUsers'] ?? 1,
      maxErrorCodes: json['maxErrorCodes'] ?? 10,
      aiQuota: json['aiQuota'] ?? 1000,
    );
  }
}

class PlanModel {
  final String id;
  final String name;
  final double price;
  final String billingCycle; // 'monthly' | 'yearly'
  final String description;
  final List<String> features;
  final PlanLimits limits;
  final bool isPopular;
  final double? discount;
  final String status;
  final String tier;

  PlanModel({
    required this.id,
    required this.name,
    required this.price,
    required this.billingCycle,
    required this.description,
    required this.features,
    required this.limits,
    this.isPopular = false,
    this.discount,
    this.status = 'active',
    this.tier = 'Basic',
  });

  factory PlanModel.fromJson(Map<String, dynamic> json) {
    double parseDouble(dynamic value) {
      if (value == null) return 0.0;
      if (value is num) return value.toDouble();
      if (value is String) return double.tryParse(value) ?? 0.0;
      return 0.0;
    }

    // Parse features (handle legacy list of objects if any, though Web Admin saves strings)
    List<String> featuresList = [];
    if (json['features'] is List) {
      featuresList = (json['features'] as List)
          .map((e) {
            if (e is String) return e;
            if (e is Map) return e['label']?.toString() ?? '';
            return e.toString();
          })
          .where((e) => e.isNotEmpty)
          .toList();
    }

    return PlanModel(
      id: json['id']?.toString() ?? '',
      name: json['name']?.toString() ?? 'Gói dịch vụ',
      price: parseDouble(json['price']),
      billingCycle: json['billingCycle']?.toString() ?? 'monthly',
      description: json['description']?.toString() ?? '',
      features: featuresList,
      limits: json['limits'] != null
          ? PlanLimits.fromJson(Map<String, dynamic>.from(json['limits']))
          : PlanLimits(),
      isPopular: json['isPopular'] == true || json['popular'] == true,
      discount: json['discount'] != null ? parseDouble(json['discount']) : null,
      status: json['status']?.toString() ?? 'active',
      tier: json['tier']?.toString() ?? 'Basic',
    );
  }

  String get formattedPrice {
    if (price == 0) return 'Miễn phí';
    return '${price.toStringAsFixed(0).replaceAllMapped(RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'), (Match m) => '${m[1]}.')}₫';
  }
}
