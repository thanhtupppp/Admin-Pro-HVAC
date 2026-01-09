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
    String? category,
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

      // Increase limit to allow broader client-side filtering
      final snapshot = await collection.limit(1000).get();

      final allErrors = snapshot.docs
          .map((doc) => ErrorCode.fromFirestore(doc))
          .toList();

      if (query.isEmpty) {
        if (category != null && category.isNotEmpty) {
          return allErrors.where((e) => e.deviceType == category).toList();
        }
        return allErrors;
      }

      final lowerQuery = query.toLowerCase().trim();
      final queryTokens = lowerQuery
          .split(' ')
          .where((t) => t.isNotEmpty)
          .toList();

      // Smart Client-side Filter with Token Matching
      return allErrors.where((error) {
        if (category != null && category.isNotEmpty) {
          if (error.deviceType != category) {
            return false;
          }
        }

        // Prepare searchable text from all relevant fields
        final searchableText = [
          error.code,
          error.title,
          error.symptom,
          error.model,
          error.cause,
          error.description ?? '',
        ].join(' ').toLowerCase();

        // Check if all tokens are present in the searchable text
        // logic: AND search (contextual).
        // Example: "samsung e1" -> requires both "samsung" and "e1" to be in the record.
        return queryTokens.every((token) => searchableText.contains(token));
      }).toList();
    } catch (e) {
      // log('Search Error: $e');
      return [];
    }
  }
}
