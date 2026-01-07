# Mobile Integration Guide (Flutter)

## Overview

This guide covers integrating Admin Pro HVAC web admin with a Flutter mobile app for technicians and field staff.

---

## Architecture

```
┌─────────────────────┐
│   Web Admin (React) │
│   - Managers        │
│   - Office Staff    │
└──────────┬──────────┘
           │
    ┌──────▼──────┐
    │  Firebase   │
    │  (Backend)  │
    └──────┬──────┘
           │
┌──────────▼─────────────┐
│  Mobile App (Flutter)  │
│  - Technicians         │
│  - Field Workers       │
└────────────────────────┘
```

---

## Setup Flutter Project

```bash
# Create Flutter project
flutter create hvac_pro_mobile
cd hvac_pro_mobile

# Add Firebase dependencies
flutter pub add firebase_core
flutter pub add firebase_auth
flutter pub add cloud_firestore
flutter pub add firebase_messaging # For notifications
flutter pub add firebase_storage   # For images
```

---

## Firebase Configuration

### 1. Configure Firebase for Flutter

```bash
# Install FlutterFire CLI
dart pub global activate flutterfire_cli

# Initialize Firebase
fl

utterfire configure
```

### 2. Update `main.dart`

```dart
import 'package:firebase_core/firebase_core.dart';
import 'firebase_options.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await Firebase.initializeApp(
    options: DefaultFirebaseOptions.currentPlatform,
  );
  runApp(MyApp());
}
```

---

## Data Sync Strategy

### Real-time Sync with Firestore

**File:** `lib/services/firestore_sync.dart`

```dart
import 'package:cloud_firestore/cloud_firestore.dart';

class FirestoreSync {
  final FirebaseFirestore _db = FirebaseFirestore.instance;
  
  // Listen to assigned jobs
  Stream<List<Job>> listenToMyJobs(String technicianId) {
    return _db
        .collection('jobs')
        .where('technicianId', isEqualTo: technicianId)
        .where('status', whereIn: ['pending', 'in_progress'])
        .orderBy('scheduledAt', descending: true)
        .snapshots()
        .map((snapshot) => snapshot.docs
            .map((doc) => Job.fromFirestore(doc))
            .toList());
  }
  
  // Update job status
  Future<void> updateJobStatus(String jobId, String status) async {
    await _db.collection('jobs').doc(jobId).update({
      'status': status,
      'updatedAt': FieldValue.serverTimestamp(),
    });
  }
  
  // Upload photo (before/after)
  Future<String> uploadJobPhoto(String jobId, File imageFile) async {
    final ref = FirebaseStorage.instance
        .ref()
        .child('jobs/$jobId/${DateTime.now().millisecondsSinceEpoch}.jpg');
    
    await ref.putFile(imageFile);
    return await ref.getDownloadURL();
  }
}
```

---

## Key Mobile Features

### 1. Job Management

**Jobs List Screen:**

```dart
class JobsListScreen extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    final userId = FirebaseAuth.instance.currentUser!.uid;
    
    return StreamBuilder<List<Job>>(
      stream: FirestoreSync().listenToMyJobs(userId),
      builder: (context, snapshot) {
        if (snapshot.hasData) {
          return ListView.builder(
            itemCount: snapshot.data!.length,
            itemBuilder: (context, index) {
              final job = snapshot.data![index];
              return JobCard(job: job);
            },
          );
        }
        return CircularProgressIndicator();
      },
    );
  }
}
```

### 2. Error Code Lookup

```dart
class ErrorCodeLookup extends StatelessWidget {
  Future<ErrorCode?> searchErrorCode(String code) async {
    final doc = await FirebaseFirestore.instance
        .collection('errorCodes')
        .where('code', isEqualTo: code)
        .limit(1)
        .get();
    
    if (doc.docs.isEmpty) return null;
    return ErrorCode.fromFirestore(doc.docs.first);
  }
  
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Column(
        children: [
          TextField(
            decoration: InputDecoration(hintText: 'Enter error code'),
            onSubmitted: (code) async {
              final error = await searchErrorCode(code);
              // Show error details
            },
          ),
          // Display error code details
        ],
      ),
    );
  }
}
```

### 3. Push Notifications

**Setup FCM:**

```dart
class NotificationService {
  final FirebaseMessaging _fcm = FirebaseMessaging.instance;
  
  Future<void> initialize() async {
    // Request permission
    await _fcm.requestPermission();
    
    // Get FCM token
    String? token = await _fcm.getToken();
    
    // Save token to Firestore
    await FirebaseFirestore.instance
        .collection('users')
        .doc(FirebaseAuth.instance.currentUser!.uid)
        .update({'fcmToken': token});
    
    // Listen to messages
    FirebaseMessaging.onMessage.listen((message) {
      // Show local notification
      _showNotification(message);
    });
  }
  
  void _showNotification(RemoteMessage message) {
    // Display notification using flutter_local_notifications
  }
}
```

**Send from Web Admin:**

```typescript
// In Cloud Function
export const sendJobAssignment = functions.firestore
  .document('jobs/{jobId}')
  .onCreate(async (snap, context) => {
    const job = snap.data();
    
    // Get technician's FCM token
    const techDoc = await admin.firestore()
      .collection('users')
      .doc(job.technicianId)
      .get();
    
    const fcmToken = techDoc.data()?.fcmToken;
    
    if (fcmToken) {
      await admin.messaging().send({
        token: fcmToken,
        notification: {
          title: 'New Job Assigned',
          body: `Job ${job.jobNumber} at ${job.address}`
        },
        data: {
          jobId: snap.id,
          type: 'job_assignment'
        }
      });
    }
  });
```

---

## Offline Support

### 1. Enable Offline Persistence

```dart
void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await Firebase.initializeApp();
  
  // Enable offline persistence
  FirebaseFirestore.instance.settings = Settings(
    persistenceEnabled: true,
    cacheSizeBytes: Settings.CACHE_SIZE_UNLIMITED,
  );
  
  runApp(MyApp());
}
```

### 2. Sync Strategy

```dart
class OfflineSync {
  // Queue offline actions
  static final List<Map<String, dynamic>> _offlineQueue = [];
  
  static Future<void> queueAction(String action, Map<String, dynamic> data) async {
    _offlineQueue.add({
      'action': action,
      'data': data,
      'timestamp': DateTime.now().toIso8601String(),
    });
    
    // Save to local storage
    await _saveQueue();
  }
  
  // Sync when online
  static Future<void> syncOfflineActions() async {
    final queue = await _loadQueue();
    
    for (final action in queue) {
      try {
        await _executeAction(action);
        _offlineQueue.remove(action);
      } catch (e) {
        print('Sync failed: $e');
      }
    }
    
    await _saveQueue();
  }
}
```

---

## Shared Data Models

Create shared type definitions between web and mobile:

**File:** `lib/models/job.dart`

```dart
class Job {
  final String id;
  final String jobNumber;
  final String customerId;
  final String customerName;
  final String address;
  final String technicianId;
  final String status;
  final DateTime scheduledAt;
  
  Job({
    required this.id,
    required this.jobNumber,
    required this.customerId,
    required this.customerName,
    required this.address,
    required this.technicianId,
    required this.status,
    required this.scheduledAt,
  });
  
  factory Job.fromFirestore(DocumentSnapshot doc) {
    final data = doc.data() as Map<String, dynamic>;
    return Job(
      id: doc.id,
      jobNumber: data['jobNumber'],
      customerId: data['customerId'],
      customerName: data['customerName'],
      address: data['address'],
      technicianId: data['technicianId'],
      status: data['status'],
      scheduledAt: (data['scheduledAt'] as Timestamp).toDate(),
    );
  }
  
  Map<String, dynamic> toFirestore() {
    return {
      'jobNumber': jobNumber,
      'customerId': customerId,
      'customerName': customerName,
      'address': address,
      'technicianId': technicianId,
      'status': status,
      'scheduledAt': Timestamp.fromDate(scheduledAt),
    };
  }
}
```

---

## State Management (Riverpod)

```dart
// Install
flutter pub add flutter_riverpod

// Provider for jobs
final jobsProvider = StreamProvider.autoDispose<List<Job>>((ref) {
  final userId = ref.watch(currentUserProvider).value?.uid;
  if (userId == null) return Stream.value([]);
  
  return FirestoreSync().listenToMyJobs(userId);
});

// Use in widget
class JobsList extends ConsumerWidget {
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final jobsAsync = ref.watch(jobsProvider);
    
    return jobsAsync.when(
      data: (jobs) => ListView.builder(
        itemCount: jobs.length,
        itemBuilder: (context, index) => JobCard(job: jobs[index]),
      ),
      loading: () => CircularProgressIndicator(),
      error: (error, stack) => Text('Error: $error'),
    );
  }
}
```

---

## Security & Authentication

### Role-based Access

```dart
class UserRole {
  static Future<bool> isTechnician() async {
    final user = FirebaseAuth.instance.currentUser;
    if (user == null) return false;
    
    final doc = await FirebaseFirestore.instance
        .collection('users')
        .doc(user.uid)
        .get();
    
    return doc.data()?['role'] == 'technician';
  }
}

// Protect screens
class JobsScreen extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return FutureBuilder<bool>(
      future: UserRole.isTechnician(),
      builder: (context, snapshot) {
        if (snapshot.data == true) {
          return JobsList();
        }
        return Text('Access Denied');
      },
    );
  }
}
```

---

## Testing Mobile App

```dart
// Widget test
testWidgets('Jobs list displays jobs', (tester) async {
  await tester.pumpWidget(MyApp());
  
  // Wait for data to load
  await tester.pumpAndSettle();
  
  // Verify job cards are displayed
  expect(find.byType(JobCard), findsWidgets);
});

// Integration test
void main() {
  IntegrationTestWidgetsFlutterBinding.ensureInitialized();
  
  testWidgets('Complete job flow', (tester) async {
    await tester.pumpWidget(MyApp());
    
    // Login
    await tester.enterText(find.byKey(Key('email')), 'tech@test.com');
    await tester.enterText(find.byKey(Key('password')), 'password');
    await tester.tap(find.text('Login'));
    await tester.pumpAndSettle();
    
    // Select job
    await tester.tap(find.byType(JobCard).first);
    await tester.pumpAndSettle();
    
    // Mark as complete
    await tester.tap(find.text('Complete'));
    await tester.pumpAndSettle();
    
    // Verify status updated
    expect(find.text('Completed'), findsOneWidget);
  });
}
```

---

## Deployment

### Android

```bash
# Build APK
flutter build apk --release

# Build App Bundle
flutter build appbundle --release
```

### iOS

```bash
# Build IPA
flutter build ios --release
```

---

## Summary

Mobile integration provides:
- ✅ Real-time job sync with Firestore
- ✅ Push notifications for assignments
- ✅ Offline support with queue sync
- ✅ Error code lookup
- ✅ Photo upload (before/after)
- ✅ Role-based access control
- ✅ State management with Riverpod

**Key Benefits:**
- Technicians stay synced with office
- Real-time updates prevent conflicts
- Offline mode for poor connectivity areas
- Shared Firebase backend reduces complexity
