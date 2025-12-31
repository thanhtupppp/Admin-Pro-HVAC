import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'bank_settings_model.dart';

class BankSettingsRepository {
  final FirebaseFirestore _firestore;

  BankSettingsRepository(this._firestore);

  Future<BankSettingsModel> getBankSettings() async {
    try {
      final docSnap = await _firestore
          .collection('settings')
          .doc('vietqr_config')
          .get();

      if (docSnap.exists && docSnap.data() != null) {
        return BankSettingsModel.fromJson(docSnap.data()!, docSnap.id);
      } else {
        // Return default if not found
        return BankSettingsModel(
          id: 'default',
          bankId: 'MB',
          bankName: 'MB Bank',
          accountNumber: '102874563321',
          accountName: 'CONG TY CONG NGHE ADMIN PRO',
          template: 'compact2',
          isActive: true,
        );
      }
    } catch (e) {
      // Fallback on error
      return BankSettingsModel(
        id: 'error_fallback',
        bankId: 'MB',
        bankName: 'MB Bank',
        accountNumber: '102874563321',
        accountName: 'CONG TY CONG NGHE ADMIN PRO',
        template: 'compact2',
        isActive: true,
      );
    }
  }
}

final bankSettingsRepositoryProvider = Provider<BankSettingsRepository>((ref) {
  return BankSettingsRepository(FirebaseFirestore.instance);
});

final bankSettingsProvider = FutureProvider<BankSettingsModel>((ref) async {
  final repository = ref.watch(bankSettingsRepositoryProvider);
  return repository.getBankSettings();
});
