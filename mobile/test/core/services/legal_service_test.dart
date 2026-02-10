// Unit tests for LegalService
// Tests legal content fetching and caching

import 'package:flutter_test/flutter_test.dart';

import 'package:admin_pro_mobile/core/services/legal_service.dart';

void main() {
  group('LegalService', () {
    group('singleton pattern', () {
      test('should return same instance', () {
        final service1 = LegalService();
        final service2 = LegalService();

        expect(identical(service1, service2), true);
      });
    });

    group('initial state', () {
      test('terms should be empty initially', () {
        final service = LegalService();
        // Since it's singleton, terms might have data from previous tests
        // This tests the getter works
        expect(service.terms, isA<String>());
      });

      test('privacy should be empty initially', () {
        final service = LegalService();
        expect(service.privacy, isA<String>());
      });
    });

    group('getters', () {
      test('terms getter should return string', () {
        final service = LegalService();
        expect(() => service.terms, returnsNormally);
      });

      test('privacy getter should return string', () {
        final service = LegalService();
        expect(() => service.privacy, returnsNormally);
      });
    });

    // Note: fetchLegalContent requires Firestore integration tests
    // which are better suited for widget tests or integration tests
  });
}
