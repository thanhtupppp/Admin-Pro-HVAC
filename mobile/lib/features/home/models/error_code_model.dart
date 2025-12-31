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

  // Mobile specific or optional fields
  final String? description; // Keep for backward compatibility or generic use
  final String? imageUrl; // Keep for single image backward compatibility
  final bool isCommon;

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
    this.steps = const [],
    this.status = 'active',
    this.severity = 'low',
    required this.updatedAt,
    this.description,
    this.imageUrl,
    this.isCommon = false,
  });

  factory ErrorCode.fromFirestore(DocumentSnapshot doc) {
    final data = doc.data() as Map<String, dynamic>;
    return ErrorCode(
      id: doc.id,
      code: data['code'] ?? '',
      title: data['title'] ?? '',
      brand: data['brand'] ?? '',
      model:
          data['model'] ??
          data['subtitle'] ??
          '', // Fallback to subtitle if model missing
      symptom: data['symptom'] ?? '',
      cause: data['cause'] ?? '',
      components: List<String>.from(data['components'] ?? []),
      steps: List<String>.from(data['steps'] ?? []),
      status: data['status'] ?? 'active',
      severity: data['severity'] ?? 'low',
      updatedAt: (data['updatedAt'] as Timestamp?)?.toDate() ?? DateTime.now(),
      description: data['description'],
      imageUrl: data['imageUrl'],
      images: List<String>.from(data['images'] ?? []),
      tools: List<String>.from(data['tools'] ?? []),
      isCommon: data['isCommon'] ?? false,
    );
  }

  Map<String, dynamic> toMap() {
    return {
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
      'updatedAt': Timestamp.fromDate(updatedAt),
      'description': description,
      'imageUrl': imageUrl,
      'images': images,
      'tools': tools,
      'isCommon': isCommon,
    };
  }
}
