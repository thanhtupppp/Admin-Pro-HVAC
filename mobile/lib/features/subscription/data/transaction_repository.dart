import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'transaction_model.dart';

class TransactionRepository {
  final FirebaseFirestore _firestore;

  TransactionRepository(this._firestore);

  Future<String> createTransaction(TransactionModel transaction) async {
    try {
      final docRef = await _firestore
          .collection('transactions')
          .add(transaction.toJson());
      return docRef.id;
    } catch (e) {
      rethrow;
    }
  }

  Stream<List<TransactionModel>> getUserTransactions(String userId) {
    return _firestore
        .collection('transactions')
        .where('userId', isEqualTo: userId)
        .orderBy('createdAt', descending: true)
        .snapshots()
        .map((snapshot) {
          return snapshot.docs
              .map((doc) => TransactionModel.fromJson(doc.data(), doc.id))
              .toList();
        });
  }
}

final transactionRepositoryProvider = Provider<TransactionRepository>((ref) {
  return TransactionRepository(FirebaseFirestore.instance);
});
