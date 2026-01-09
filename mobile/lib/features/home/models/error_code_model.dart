import 'package:cloud_firestore/cloud_firestore.dart';

class ErrorCode {
  final String id;
  final String code;
  final String title;
  final String brand;
  final String model; // Matches Web 'model'
  final String symptom; // Matches Web 'symptom'
  final String cause; // Matches Web 'cause'
  final List<String> components; // Matches Web 'components'
  final List<String> steps; // Matches Web 'steps'
  final String status; // 'active', 'pending', 'draft'
  final String severity; // 'high', 'medium', 'low'
  final DateTime updatedAt; // Matches Web 'updatedAt'
  final List<String> tools;
  final List<String> images; // List of Drive links or AI images
  final List<String> videos; // YouTube links

  final String? description; // Keep for backward compatibility or generic use
  final String? imageUrl; // Keep for single image backward compatibility
  final bool isCommon;
  final String deviceType; // 'AC', 'Fridge', 'Washer', 'Other'

  ErrorCode({
    required this.id,
    required this.code,
    required this.title,
    required this.brand,
    required this.model,
    this.symptom = '',
    this.cause = '',
    this.components = const [],
    this.tools = const [],
    this.images = const [],
    this.videos = const [],
    this.steps = const [],
    this.status = 'active',
    this.severity = 'low',
    required this.updatedAt,
    this.description,
    this.imageUrl,
    this.isCommon = false,
    this.deviceType = 'Other',
  });

  // Helper to parse updatedAt which can be Timestamp (from mobile) or String (from web)
  static DateTime _parseDateTime(dynamic value) {
    if (value == null) return DateTime.now();
    if (value is Timestamp) return value.toDate();
    if (value is String) {
      try {
        return DateTime.parse(value);
      } catch (_) {
        return DateTime.now();
      }
    }
    return DateTime.now();
  }

  static String _inferDeviceType(Map<String, dynamic> data) {
    if (data['deviceType'] != null &&
        data['deviceType'].toString().isNotEmpty) {
      return data['deviceType'];
    }

    final text =
        '${data['title']} ${data['model']} ${data['brand']} ${data['symptom']}'
            .toLowerCase();

    if (text.contains('máy giặt') ||
        text.contains('washer') ||
        text.contains('lồng giặt')) {
      return 'Washer';
    }
    if (text.contains('tủ lạnh') ||
        text.contains('fridge') ||
        text.contains('đông') ||
        text.contains('lạnh')) {
      // "lạnh" is tricky because "máy lạnh" (AC). Check specifically "tủ lạnh" or assume AC for "máy lạnh".
      if (text.contains('tủ lạnh') ||
          text.contains('ngăn đông') ||
          text.contains('fridge')) {
        return 'Fridge';
      }
    }
    // Default or detected for AC
    if (text.contains('điều hòa') ||
        text.contains('máy lạnh') ||
        text.contains('air conditioner') ||
        text.contains('ac') ||
        text.contains('inverter') ||
        text.contains('vrv')) {
      return 'AC';
    }

    return 'Other';
  }

  factory ErrorCode.fromFirestore(DocumentSnapshot doc) {
    final data = doc.data() as Map<String, dynamic>;
    return ErrorCode(
      id: doc.id,
      code: data['code'] ?? '',
      title: data['title'] ?? '',
      brand: data['brand'] ?? '',
      model: data['model'] ?? data['subtitle'] ?? '',
      symptom: data['symptom'] ?? '',
      cause: data['cause'] ?? '',
      components: List<String>.from(data['components'] ?? []),
      steps: List<String>.from(data['steps'] ?? []),
      status: data['status'] ?? 'active',
      severity: data['severity'] ?? 'low',
      updatedAt: _parseDateTime(data['updatedAt']),
      description: data['description'],
      imageUrl: data['imageUrl'],
      images: List<String>.from(data['images'] ?? []),
      videos: List<String>.from(data['videos'] ?? []),
      tools: List<String>.from(data['tools'] ?? []),
      isCommon: data['isCommon'] ?? false,
      deviceType: _inferDeviceType(data),
    );
  }

  factory ErrorCode.fromMap(Map<String, dynamic> map, String id) {
    return ErrorCode(
      id: id.isNotEmpty ? id : (map['id'] ?? ''),
      code: map['code'] ?? '',
      title: map['title'] ?? '',
      brand: map['brand'] ?? '',
      model: map['model'] ?? map['subtitle'] ?? '',
      symptom: map['symptom'] ?? '',
      cause: map['cause'] ?? '',
      components: List<String>.from(map['components'] ?? []),
      steps: List<String>.from(map['steps'] ?? []),
      status: map['status'] ?? 'active',
      severity: map['severity'] ?? 'low',
      updatedAt: _parseDateTime(map['updatedAt']),
      description: map['description'],
      imageUrl: map['imageUrl'],
      images: List<String>.from(map['images'] ?? []),
      videos: List<String>.from(map['videos'] ?? []),
      tools: List<String>.from(map['tools'] ?? []),
      isCommon: map['isCommon'] ?? false,
      deviceType: _inferDeviceType(map),
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'id': id, // Ensure ID is saved
      'code': code,
      'title': title,
      'brand': brand,
      'model': model,
      'symptom': symptom,
      'cause': cause,
      'components': components,
      'steps': steps,
      'status': status,
      'severity': severity,
      'updatedAt': updatedAt.toIso8601String(), // Save as String for JSON
      'description': description,
      'imageUrl': imageUrl,
      'images': images,
      'videos': videos,
      'tools': tools,
      'isCommon': isCommon,
      'deviceType': deviceType,
    };
  }
}
