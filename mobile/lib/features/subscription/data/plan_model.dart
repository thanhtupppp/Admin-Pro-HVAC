import 'package:flutter/material.dart';
import '../../../core/constants/app_colors.dart';

class PlanFeature {
  final String label;
  final bool enabled;

  PlanFeature({required this.label, required this.enabled});

  factory PlanFeature.fromJson(Map<String, dynamic> json) {
    return PlanFeature(
      label: json['label'] ?? '',
      enabled: json['enabled'] ?? false,
    );
  }
}

class PlanModel {
  final String id;
  final String name;
  final String displayName;
  final double price; // Using double for currency
  final String billingCycle;
  final String description;
  final List<PlanFeature> features;
  final String? badge;
  final String? badgeColorString;
  final bool isPopular;
  final String tier;
  final String status;

  PlanModel({
    required this.id,
    required this.name,
    required this.displayName,
    required this.price,
    required this.billingCycle,
    required this.tier,
    required this.description,
    required this.features,
    this.badge,
    this.badgeColorString,
    this.isPopular = false,
    this.status = 'active',
  });

  factory PlanModel.fromJson(Map<String, dynamic> json) {
    // Helper to get double safely
    double parseDouble(dynamic value) {
      if (value == null) return 0.0;
      if (value is num) return value.toDouble();
      if (value is String) return double.tryParse(value) ?? 0.0;
      return 0.0;
    }

    final name = json['name']?.toString() ?? json['Name']?.toString() ?? '';
    final displayName =
        json['displayName']?.toString() ??
        json['DisplayName']?.toString() ??
        json['display_name']?.toString() ??
        '';

    // Handle features safely (Map vs String legacy)
    final featuresRaw = json['features'] ?? json['Features'];
    List<PlanFeature> features = [];
    if (featuresRaw is List) {
      features = featuresRaw.map<PlanFeature>((e) {
        if (e is Map) {
          return PlanFeature.fromJson(Map<String, dynamic>.from(e));
        } else {
          // Fallback for legacy string features
          return PlanFeature(label: e.toString(), enabled: true);
        }
      }).toList();
    }

    return PlanModel(
      id: json['id']?.toString() ?? '',
      name: name,
      displayName: displayName,
      price: parseDouble(json['price'] ?? json['Price']),
      billingCycle:
          (json['billingCycle'] ?? json['billing_cycle'])?.toString() ??
          'monthly',
      tier: (json['tier'] ?? 'Internal').toString(),
      description:
          (json['description'] ?? json['Description'])?.toString() ?? '',
      features: features,
      badge: (json['badge'] ?? json['Badge'])?.toString(),
      badgeColorString: (json['badgeColor'] ?? json['badge_color'])?.toString(),
      isPopular: json['popular'] == true || json['isPopular'] == true,
      status: json['status']?.toString() ?? 'inactive',
    );
  }

  // Helper to get Color from string
  Color get badgeColor {
    if (badgeColorString == 'primary') return AppColors.primary;
    if (badgeColorString == 'gray') return Colors.grey;
    return AppColors.primary; // Default
  }

  // Format Price
  String get formattedPrice {
    if (price == 0) return 'Miễn phí';
    // Simple formatter, can use NumberFormat if Intl is set up
    return '${price.toStringAsFixed(0).replaceAllMapped(RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'), (Match m) => '${m[1]}.')}₫';
  }
}
