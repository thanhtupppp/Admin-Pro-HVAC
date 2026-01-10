import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:flutter/foundation.dart';

class LegalService {
  static final LegalService _instance = LegalService._internal();
  factory LegalService() => _instance;
  LegalService._internal();

  String _terms = '';
  String _privacy = '';
  bool _initialized = false;

  /// Fetch legal content from Firestore
  /// Returns a map with 'terms' and 'privacy'
  Future<Map<String, String>> fetchLegalContent() async {
    if (_initialized && _terms.isNotEmpty && _privacy.isNotEmpty) {
      return {'terms': _terms, 'privacy': _privacy};
    }

    try {
      final doc = await FirebaseFirestore.instance
          .collection('configurations')
          .doc('legal')
          .get();
      if (doc.exists && doc.data() != null) {
        final data = doc.data()!;
        _terms = data['termsOfService'] ?? '';
        _privacy = data['privacyPolicy'] ?? '';
        _initialized = true;
      }
    } catch (e) {
      debugPrint('Error fetching legal content: $e');
    }

    return {'terms': _terms, 'privacy': _privacy};
  }

  /// Get cached terms
  String get terms => _terms;

  /// Get cached privacy
  String get privacy => _privacy;
}
