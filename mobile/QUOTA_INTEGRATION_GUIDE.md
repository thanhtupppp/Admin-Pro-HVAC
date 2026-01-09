# Quota Integration into Search Flow

## Files Modified
- `search_screen.dart` - Add quota checks before search

## Implementation Steps

### 1. Add необходимые imports to search_screen.dart

```dart
// At top of file, add:
import 'package:firebase_auth/firebase_auth.dart';
import '../subscription/services/quota_service.dart';
import '../subscription/services/permissions_service.dart';
import '../subscription/data/plan_model.dart';
import '../subscription/data/plan_repository.dart';
import '../../shared/widgets/quota_indicator.dart';
import '../../core/services/ad_service.dart';
```

### 2. Add state variables to _SearchScreenState

```dart
class _SearchScreenState extends ConsumerState<SearchScreen> {
  // ... existing variables ...
  
  // NEW: Quota & Permissions
  QuotaService? _quotaService;
  PermissionsService? _permissionsService;
  PlanModel? _userPlan;
  bool _isInitializing = true;
```

### 3. Initialize services in initState

```dart
@override
void initState() {
  super.initState();
  _initializeQuotaServices();
  _loadHistory();
  _performSearch('');
}

Future<void> _initializeQuotaServices() async {
  final user = FirebaseAuth.instance.currentUser;
  if (user == null) {
    setState(() => _isInitializing = false);
    return;
  }

  final planRepo = PlanRepository();
  final plan = await planRepo.getUserPlan(user.uid);

  if (plan != null) {
    setState(() {
      _userPlan = plan;
      _quotaService = QuotaService(
        userId: user.uid,
        dailyLimit: plan.quotas.dailyErrorSearchLimit ?? 999999,
      );
      _permissionsService = PermissionsService(plan);
      _isInitializing = false;
    });

    // Preload ad for Free users
    if (plan.isFree) {
      AdService().loadRewardedAd();
    }
  } else {
    setState(() => _isInitializing = false);
  }
}
```

### 4. Wrap _performSearch with quota check

```dart
Future<void> _performSearch(String query) async {
  // Check quota BEFORE searching (for non-empty queries)
  if (query.isNotEmpty && _quotaService != null && _permissionsService != null) {
    final canSearch = await _permissionsService!.canPerformErrorSearch(_quotaService!);
    
    if (!canSearch) {
      // Show quota exhausted dialog
      if (mounted) {
        final quota = await _quotaService!.getTodayQuota();
        _showQuotaExhaustedDialog(quota);
      }
      return; // Don't perform search
    }
  }

  // Original search logic
  if (_debounce?.isActive ?? false) _debounce!.cancel();
  _debounce = Timer(const Duration(milliseconds: 500), () async {
    setState(() => _isLoading = true);

    try {
      final results = await _repository.search(
        query: query,
        brand: _selectedBrand,
        category: _selectedCategory,
      );

      if (mounted) {
        setState(() {
          _results = results;
          _isLoading = false;
        });

        // Consume quota (only for non-empty queries)
        if (query.isNotEmpty && _quotaService != null && _userPlan?.isFree == true) {
          await  _quotaService!.consumeErrorSearch();
        }

        // Save to history
        if (query.isNotEmpty && !_history.contains(query)) {
          await _historyRepository.addQuery(query);
          await _loadHistory();
        }
      }
    } catch (e) {
      if (mounted) {
        setState(() => _isLoading = false);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Lỗi: ${e.toString()}')),
        );
      }
    }
  });
}
```

### 5. Add quota exhausted dialog

```dart
void _showQuotaExhaustedDialog(UserQuota quota) {
  _permissionsService!.showQuotaExhaustedDialog(
    context,
    used: quota.errorSearchesUsed,
    limit: quota.totalLimit,
    onWatchAd: () async {
      final success = await AdService().showRewardedAd(
        onUserEarnedReward: () async {
          await _quotaService!.rewardFromAd();
          if (mounted) {
            ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(
                content: Text('🎁 +1 lượt tra từ quảng cáo!'),
                backgroundColor: Colors.green,
              ),
            );
          }
        },
      );

      if (!success && mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Quảng cáo chưa sẵn sàng, thử lại sau')),
        );
      }
    },
    onUpgrade: () {
      // TODO: Navigate to subscription screen
      context.push('/subscription');
    },
  );
}
```

### 6. Add quota indicator to UI (in build method)

```dart
@override
Widget build(BuildContext context) {
  if (_isInitializing) {
    return const Scaffold(
      body: Center(child: CircularProgressIndicator()),
    );
  }

  return Scaffold(
    backgroundColor: AppColors.background,
    body: SafeArea(
      child: Column(
        children: [
          // Quota indicator for Free users
          if (_userPlan?.isFree == true && _quotaService != null)
            StreamBuilder<UserQuota>(
              stream: _quotaService!.watchTodayQuota(),
              builder: (context, snapshot) {
                if (!snapshot.hasData) return const SizedBox.shrink();
                
                return QuotaIndicator(
                  quota: snapshot.data!,
                  onWatchAd: () async {
                    // Show ad logic
                  },
                  onUpgrade: () => context.push('/subscription'),
                );
              },
            ),
          
          // Rest of existing UI...
        ],
      ),
    ),
  );
}
```

### 7. Initialize AdMob in main.dart

```dart
// In main.dart, before runApp:
void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await Firebase.initializeApp();
  await AdService.initialize(); // Add this
  
  runApp(const MyApp());
}
```

## Result

- ✅ Free users can search 5 times/day
- ✅ Quota shown in real-time
- ✅ When exhausted, can watch ads for +1
- ✅ Paid users have unlimited searches
- ✅ Quota resets daily automatically
