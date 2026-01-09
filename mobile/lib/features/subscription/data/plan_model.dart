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

class PlanQuotas {
  final int? dailyErrorSearchLimit; // null = unlimited
  final bool hasAdsRewards; // Can earn quota from ads

  const PlanQuotas({this.dailyErrorSearchLimit, this.hasAdsRewards = false});

  factory PlanQuotas.fromJson(Map<String, dynamic>? json) {
    if (json == null) {
      return const PlanQuotas(dailyErrorSearchLimit: 5, hasAdsRewards: true);
    }

    return PlanQuotas(
      dailyErrorSearchLimit: json['dailyErrorSearchLimit'],
      hasAdsRewards: json['hasAdsRewards'] ?? false,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'dailyErrorSearchLimit': dailyErrorSearchLimit,
      'hasAdsRewards': hasAdsRewards,
    };
  }

  bool get isUnlimited => dailyErrorSearchLimit == null;
}

class PlanPermissions {
  final bool canSearchErrors;
  final bool canUseTools; // Thước đo, gas, etc.
  final bool canExportData;
  final bool hasAdsFree; // Không hiện ads
  final bool hasPrioritySupport;

  const PlanPermissions({
    this.canSearchErrors = true,
    this.canUseTools = false,
    this.canExportData = false,
    this.hasAdsFree = false,
    this.hasPrioritySupport = false,
  });

  factory PlanPermissions.fromJson(Map<String, dynamic>? json) {
    if (json == null) {
      // Default Free plan permissions
      return const PlanPermissions(
        canSearchErrors: true,
        canUseTools: false,
        canExportData: false,
        hasAdsFree: false,
        hasPrioritySupport: false,
      );
    }

    return PlanPermissions(
      canSearchErrors: json['canSearchErrors'] ?? true,
      canUseTools: json['canUseTools'] ?? false,
      canExportData: json['canExportData'] ?? false,
      hasAdsFree: json['hasAdsFree'] ?? false,
      hasPrioritySupport: json['hasPrioritySupport'] ?? false,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'canSearchErrors': canSearchErrors,
      'canUseTools': canUseTools,
      'canExportData': canExportData,
      'hasAdsFree': hasAdsFree,
      'hasPrioritySupport': hasPrioritySupport,
    };
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

  // New fields
  final bool isFree;
  final PlanPermissions permissions;
  final PlanQuotas quotas;

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
    bool? isFree,
    PlanPermissions? permissions,
    PlanQuotas? quotas,
  }) : isFree = isFree ?? (price == 0),
       permissions = permissions ?? const PlanPermissions(),
       quotas = quotas ?? const PlanQuotas();

  factory PlanModel.fromJson(Map<String, dynamic> json) {
    double parseDouble(dynamic value) {
      if (value == null) return 0.0;
      if (value is num) return value.toDouble();
      if (value is String) return double.tryParse(value) ?? 0.0;
      return 0.0;
    }

    // Parse features
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

    final price = parseDouble(json['price']);

    return PlanModel(
      id: json['id']?.toString() ?? '',
      name: json['name']?.toString() ?? 'Gói dịch vụ',
      price: price,
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
      isFree: json['isFree'] ?? (price == 0),
      permissions: PlanPermissions.fromJson(
        json['permissions'] != null
            ? Map<String, dynamic>.from(json['permissions'])
            : null,
      ),
      quotas: PlanQuotas.fromJson(
        json['quotas'] != null
            ? Map<String, dynamic>.from(json['quotas'])
            : null,
      ),
    );
  }

  String get formattedPrice {
    if (price == 0) return 'Miễn phí';
    return '${price.toStringAsFixed(0).replaceAllMapped(RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'), (Match m) => '${m[1]}.')}₫';
  }
}
