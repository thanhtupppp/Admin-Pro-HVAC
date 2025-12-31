import 'package:cloud_firestore/cloud_firestore.dart';
import '../home/models/error_code_model.dart';

class SearchRepository {
  final FirebaseFirestore _firestore;

  SearchRepository({FirebaseFirestore? firestore})
    : _firestore = firestore ?? FirebaseFirestore.instance;

  Future<List<ErrorCode>> searchErrors({
    required String query,
    String? brand,
    String? model,
  }) async {
    try {
      Query collection = _firestore.collection('error_codes');

      // Basic filtering
      if (brand != null && brand.isNotEmpty) {
        collection = collection.where('brand', isEqualTo: brand);
      }

      // Note: Firestore doesn't support full-text search natively without Algolia/Elasticsearch.
      // We will implement a client-side filter for this MVP or simple prefix matching.
      // For a "Smart Suggestion", we fetch a broader set and filter locally.

      final snapshot = await collection.limit(50).get();

      final allErrors = snapshot.docs
          .map((doc) => ErrorCode.fromFirestore(doc))
          .toList();

      if (query.isEmpty) return allErrors;

      final lowerQuery = query.toLowerCase();

      // Smart Client-side Filter
      return allErrors.where((error) {
        final matchesCode = error.code.toLowerCase().contains(lowerQuery);
        final matchesTitle = error.title.toLowerCase().contains(lowerQuery);
        final matchesSymptom = error.symptom.toLowerCase().contains(lowerQuery);
        final matchesModel = error.model.toLowerCase().contains(lowerQuery);

        return matchesCode || matchesTitle || matchesSymptom || matchesModel;
      }).toList();
    } catch (e) {
      // log('Search Error: $e');
      return [];
    }
  }
}
