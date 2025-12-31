import 'package:cloud_firestore/cloud_firestore.dart';

import '../models/error_code_model.dart';

class DashboardRepository {
  final FirebaseFirestore _firestore;

  DashboardRepository(this._firestore);

  Stream<List<ErrorCode>> getRecentErrors() {
    return _firestore
        .collection('error_codes')
        .orderBy('updatedAt', descending: true)
        .limit(5)
        .snapshots()
        .map((snapshot) {
          return snapshot.docs
              .map((doc) => ErrorCode.fromFirestore(doc))
              .toList();
        });
  }

  Stream<List<ErrorCode>> getCommonErrors() {
    return _firestore
        .collection('error_codes')
        .where('isCommon', isEqualTo: true)
        .limit(5)
        .snapshots()
        .map((snapshot) {
          return snapshot.docs
              .map((doc) => ErrorCode.fromFirestore(doc))
              .toList();
        });
  }

  Future<void> seedData() async {
    final errorsCollection = _firestore.collection('error_codes');
    final snapshot = await errorsCollection.limit(1).get();

    if (snapshot.docs.isEmpty) {
      // Seed initial data
      final initialData = [
        ErrorCode(
          id: '1',
          code: 'E1',
          title: 'Lỗi cảm biến nhiệt độ phòng',
          brand: 'Samsung',
          model: 'Samsung Inverter AR10',
          symptom: 'Máy lạnh không lạnh, đèn nháy.',
          cause: 'Cảm biến nhiệt độ phòng bị hỏng hoặc ngắn mạch.',
          components: ['Cảm biến nhiệt', 'Bo mạch'],
          steps: ['Kiểm tra trở kháng cảm biến', 'Thay thế cảm biến'],
          status: 'active',
          severity: 'medium',
          updatedAt: DateTime.now(),
          description: 'Lỗi cảm biến nhiệt độ phòng (Room Sensor Error)',
          imageUrl:
              'https://images.unsplash.com/photo-1554995207-c18c203602cb?auto=format&fit=crop&q=80&w=300',
          isCommon: true,
        ),
        ErrorCode(
          id: '2',
          code: 'H11',
          title: 'Lỗi giao tiếp khối trong và ngoài',
          brand: 'Panasonic',
          model: 'Panasonic Sky Series',
          symptom: 'Máy không hoạt động sau 1 phút.',
          cause: 'Dây kết nối bị đứt hoặc bo mạch lỗi.',
          components: ['Dây tín hiệu', 'Bo mạch dàn lạnh', 'Bo mạch dàn nóng'],
          steps: ['Kiểm tra dây kết nối', 'Kiểm tra nguồn cấp'],
          status: 'active',
          severity: 'high',
          updatedAt: DateTime.now().subtract(const Duration(hours: 2)),
          description: 'Lỗi đường truyền dữ liệu giữa khối trong và ngoài.',
          imageUrl:
              'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&q=80&w=300',
          isCommon: true,
        ),
        ErrorCode(
          id: '3',
          code: 'UE',
          title: 'Lỗi vắt không cân bằng',
          brand: 'LG',
          model: 'LG Inverter Direct Drive',
          symptom: 'Máy rung lắc mạnh, không vắt.',
          cause: 'Quần áo phân bố không đều hoặc chân máy không cân.',
          components: ['Lồng giặt', 'Chân đế'],
          steps: ['Sắp xếp lại quần áo', 'Cân chỉnh chân máy'],
          status: 'active',
          severity: 'low',
          updatedAt: DateTime.now().subtract(const Duration(days: 1)),
          description: 'Lỗi cân bằng lồng giặt (Unbalance Error)',
          imageUrl:
              'https://images.unsplash.com/photo-1626806819282-2c1dc01a5e0c?auto=format&fit=crop&q=80&w=300',
          isCommon: true,
        ),
        ErrorCode(
          id: '4',
          code: 'P01',
          title: 'Bảo vệ quá tải lốc',
          brand: 'Daikin',
          model: 'Daikin VRV IV',
          symptom: 'Lốc ngắt liên tục.',
          cause: 'Gas quá nạp, dàn nóng bẩn, quạt yếu.',
          components: ['Máy nén', 'Quạt dàn nóng'],
          steps: ['Vệ sinh dàn nóng', 'Đo áp suất gas'],
          status: 'active',
          severity: 'high',
          updatedAt: DateTime.now().subtract(const Duration(days: 2)),
          description: 'Máy nén quá tải nhiệt hoặc dòng.',
          imageUrl:
              'https://images.unsplash.com/photo-1581094794329-cd8119604f89?auto=format&fit=crop&q=80&w=300',
          isCommon: false,
        ),
        ErrorCode(
          id: '5',
          code: 'IE',
          title: 'Lỗi cấp nước',
          brand: 'Toshiba',
          model: 'Toshiba A800',
          symptom: 'Nước không vào máy sau thời gian quy định.',
          cause: 'Van cấp nước hỏng, lưới lọc bẩn, mất nước nguồn.',
          components: ['Van cấp nước', 'Lưới lọc'],
          steps: ['Vệ sinh lưới lọc', 'Thay van cấp nước'],
          status: 'active',
          severity: 'medium',
          updatedAt: DateTime.now().subtract(const Duration(days: 3)),
          description: 'Lỗi nguồn cấp nước vào máy giặt.',
          imageUrl:
              'https://images.unsplash.com/photo-1610557892470-55d9e80c0bce?auto=format&fit=crop&q=80&w=300',
          isCommon: true,
        ),
      ];

      for (final error in initialData) {
        // Use set with merge to update existing but here we simulate fresh
        await errorsCollection.doc(error.id).set(error.toMap());
      }
    }
  }
}
