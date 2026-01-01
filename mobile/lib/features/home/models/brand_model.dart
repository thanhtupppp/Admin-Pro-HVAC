import 'package:cloud_firestore/cloud_firestore.dart';

class Brand {
  final String id;
  final String name;
  final String logo;
  final int modelCount;

  Brand({
    required this.id,
    required this.name,
    required this.logo,
    this.modelCount = 0,
  });

  factory Brand.fromFirestore(DocumentSnapshot doc) {
    final data = doc.data() as Map<String, dynamic>;
    return Brand(
      id: doc.id,
      name: data['name'] ?? '',
      logo: data['logo'] ?? '',
      modelCount: data['modelCount'] ?? 0,
    );
  }

  Map<String, dynamic> toMap() {
    return {'name': name, 'logo': logo, 'modelCount': modelCount};
  }
}
