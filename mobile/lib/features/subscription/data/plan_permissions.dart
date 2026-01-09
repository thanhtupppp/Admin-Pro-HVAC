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

  @override
  String toString() {
    return 'PlanPermissions(search: $canSearchErrors, tools: $canUseTools, export: $canExportData, adsFree: $hasAdsFree, support: $hasPrioritySupport)';
  }
}
