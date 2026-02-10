import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:gap/gap.dart';
import 'package:go_router/go_router.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import '../../core/constants/app_colors.dart';
import '../home/models/error_code_model.dart';
import '../auth/providers/auth_provider.dart';
import '../video/video_player_screen.dart';
import '../troubleshoot/troubleshoot_screen.dart';
import '../saved/providers/saved_provider.dart';
import '../history/providers/history_provider.dart';
import '../../core/services/ad_service.dart';
import '../../shared/widgets/ad_banner_widget.dart';
import '../../core/services/security_service.dart';

class ErrorDetailScreen extends ConsumerStatefulWidget {
  final ErrorCode errorCode;

  const ErrorDetailScreen({super.key, required this.errorCode});

  @override
  ConsumerState<ErrorDetailScreen> createState() => _ErrorDetailScreenState();
}

class _ErrorDetailScreenState extends ConsumerState<ErrorDetailScreen> {
  bool _hasWatchedAd = false;
  bool _isLoadingAd = false;

  @override
  void initState() {
    // Enable Sensitive Mode (Screenshot Detection)
    SecurityService().setSensitive(true);

    super.initState();
    // Auto-add to history and increment view count
    WidgetsBinding.instance.addPostFrameCallback((_) {
      ref
          .read(historyNotifierProvider.notifier)
          .addToHistory(widget.errorCode.id);

      // Increment view count in Firestore
      _incrementViewCount(widget.errorCode.id);

      // Check premium status
      final authState = ref.read(authProvider);
      final isPremium =
          authState.userData?['plan'] != 'Free' &&
          authState.userData?['plan'] != null;

      setState(() {
        // Premium users bypass ad gate
        _hasWatchedAd = isPremium;
      });

      // Preload rewarded ad for free users
      if (!isPremium) {
        AdService().loadRewardedAd();
      }

      // Try show interstitial (only if already passed ad gate)
      if (isPremium) {
        AdService().showInterstitialIfEligible(isPremium: isPremium);
      }
    });
  }

  /// Increment view count for analytics
  Future<void> _incrementViewCount(String errorId) async {
    try {
      // Use set with merge to handle case where views field doesn't exist
      await FirebaseFirestore.instance
          .collection('error_codes')
          .doc(errorId)
          .set({'views': FieldValue.increment(1)}, SetOptions(merge: true));
      debugPrint('Successfully incremented view count for $errorId');
    } catch (e) {
      // Silently fail - view count is not critical
      debugPrint('Failed to increment view count: $e');
    }
  }

  /// Show rewarded ad to unlock content
  Future<void> _showRewardedAdToUnlock() async {
    setState(() => _isLoadingAd = true);

    final success = await AdService().showRewardedAd(
      onUserEarnedReward: () {
        setState(() {
          _hasWatchedAd = true;
        });
      },
      onAdDismissed: () {
        setState(() => _isLoadingAd = false);
      },
    );

    if (!success) {
      setState(() => _isLoadingAd = false);
      // Ad not available - allow access anyway (graceful degradation)
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Quảng cáo không sẵn sàng. Bạn có thể xem nội dung.'),
            duration: Duration(seconds: 2),
          ),
        );
        setState(() => _hasWatchedAd = true);
      }
    }
  }

  @override
  void dispose() {
    // Disable Sensitive Mode
    SecurityService().setSensitive(false);
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final errorCode = widget.errorCode;
    final savedIdsAsync = ref.watch(savedIdsProvider);
    final isSaved = savedIdsAsync.value?.contains(errorCode.id) ?? false;

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        backgroundColor: AppColors.background,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: Colors.white),
          onPressed: () => context.pop(),
        ),
        title: Text(
          errorCode.title,
          textAlign: TextAlign.center,
          maxLines: 1,
          overflow: TextOverflow.ellipsis,
          style: const TextStyle(
            color: Colors.white,
            fontWeight: FontWeight.bold,
            fontSize: 18,
          ),
        ),
        centerTitle: true,
        actions: [
          IconButton(
            onPressed: () {
              ref.read(savedIdsProvider.notifier).toggle(errorCode.id);
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(
                  content: Text(
                    isSaved
                        ? 'Đã bỏ lưu mã lỗi'
                        : 'Đã lưu mã lỗi vào Yêu thích',
                  ),
                  duration: const Duration(seconds: 1),
                ),
              );
            },
            icon: Icon(
              isSaved ? Icons.bookmark : Icons.bookmark_border,
              color: isSaved ? AppColors.primary : Colors.white,
            ),
          ),
          const Gap(8),
        ],
      ),
      body: SafeArea(
        child: Stack(
          children: [
            // Main content (blurred for free users until ad is watched)
            Column(
              children: [
                Expanded(
                  child: SingleChildScrollView(
                    padding: const EdgeInsets.fromLTRB(24, 16, 24, 100),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.stretch,
                      children: [
                        // 1. Images or Code Hero
                        if (errorCode.images.isNotEmpty)
                          _buildImageCarousel()
                        else
                          _buildHeroSection(),

                        const Gap(24),
                        const Divider(height: 1, color: Color(0xFF1E293B)),
                        const Gap(24),

                        // 2. Info Sections
                        if (errorCode.symptom.isNotEmpty) ...[
                          _buildInfoSection(
                            'Triệu chứng',
                            Icons.monitor_heart_outlined,
                            errorCode.symptom,
                          ),
                          const Gap(24),
                        ],

                        if (errorCode.cause.isNotEmpty) ...[
                          _buildInfoSection(
                            'Nguyên nhân & Cách kiểm tra',
                            Icons.search,
                            errorCode.cause,
                          ),
                          const Gap(24),
                        ],

                        // 3. Components & Tools
                        if (errorCode.components.isNotEmpty) ...[
                          _buildTagsSection(
                            'Linh kiện liên quan',
                            Icons.extension,
                            errorCode.components,
                            Colors.blue,
                          ),
                          const Gap(24),
                        ],

                        if (errorCode.tools.isNotEmpty) ...[
                          _buildTagsSection(
                            'Dụng cụ cần thiết',
                            Icons.build_circle,
                            errorCode.tools,
                            Colors.orange,
                          ),
                          const Gap(24),
                        ],

                        // 4. Repair Steps
                        if (errorCode.steps.isNotEmpty) ...[
                          _buildStepsSection(),
                          const Gap(24),
                        ],

                        // 5. Videos (YouTube)
                        if (widget.errorCode.videos.isNotEmpty)
                          _buildVideosSection(context),

                        // Ad Banner
                        const Center(
                          child: Padding(
                            padding: EdgeInsets.symmetric(vertical: 24),
                            child: AdBannerWidget(
                              placement: AdPlacement.detail,
                            ),
                          ),
                        ),

                        const Gap(80),
                      ],
                    ),
                  ),
                ),
                _buildBottomAction(context),
              ],
            ),

            // Ad Gate Overlay for Free Users
            if (!_hasWatchedAd) _buildAdGateOverlay(),
          ],
        ),
      ),
    );
  }

  /// Build the ad gate overlay that blocks content for free users
  Widget _buildAdGateOverlay() {
    return Container(
      color: AppColors.background.withValues(alpha: 0.95),
      child: Center(
        child: Padding(
          padding: const EdgeInsets.all(32),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Icon(
                Icons.lock_outline,
                size: 64,
                color: AppColors.primary,
              ),
              const Gap(24),
              const Text(
                'Xem quảng cáo để mở khóa nội dung',
                style: TextStyle(
                  color: Colors.white,
                  fontSize: 20,
                  fontWeight: FontWeight.bold,
                ),
                textAlign: TextAlign.center,
              ),
              const Gap(12),
              Text(
                'Người dùng miễn phí cần xem một đoạn quảng cáo ngắn để truy cập hướng dẫn sửa chữa',
                style: TextStyle(
                  color: Colors.white.withValues(alpha: 0.7),
                  fontSize: 14,
                ),
                textAlign: TextAlign.center,
              ),
              const Gap(32),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton.icon(
                  onPressed: _isLoadingAd ? null : _showRewardedAdToUnlock,
                  icon: _isLoadingAd
                      ? const SizedBox(
                          width: 20,
                          height: 20,
                          child: CircularProgressIndicator(
                            color: Colors.white,
                            strokeWidth: 2,
                          ),
                        )
                      : const Icon(Icons.play_circle_filled),
                  label: Text(
                    _isLoadingAd ? 'Đang tải...' : 'Xem quảng cáo',
                    style: const TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.primary,
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(vertical: 16),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                  ),
                ),
              ),
              const Gap(16),
              TextButton(
                onPressed: () => context.pop(),
                child: Text(
                  'Quay lại',
                  style: TextStyle(color: Colors.white.withValues(alpha: 0.7)),
                ),
              ),
              const Gap(24),
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: Colors.amber.withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(
                    color: Colors.amber.withValues(alpha: 0.3),
                  ),
                ),
                child: Row(
                  children: [
                    const Icon(Icons.star, color: Colors.amber, size: 20),
                    const Gap(8),
                    Expanded(
                      child: Text(
                        'Nâng cấp Premium để bỏ qua quảng cáo',
                        style: TextStyle(
                          color: Colors.amber.withValues(alpha: 0.9),
                          fontSize: 12,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildHeroSection() {
    return Column(
      children: [
        Text(
          widget.errorCode.code,
          style: const TextStyle(
            fontSize: 80,
            fontWeight: FontWeight.w900,
            color: Color(0xFF136DEC),
            height: 1.0,
          ),
        ),
        const Gap(8),
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
          decoration: BoxDecoration(
            color: AppColors.surface,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: Colors.white10),
          ),
          child: Text(
            "${widget.errorCode.brand} • ${widget.errorCode.model}",
            style: const TextStyle(
              color: AppColors.textSecondary,
              fontWeight: FontWeight.bold,
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildImageCarousel() {
    return SizedBox(
      height: 200,
      child: PageView.builder(
        itemCount: widget.errorCode.images.length,
        itemBuilder: (context, index) {
          return Container(
            margin: const EdgeInsets.symmetric(horizontal: 4),
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(16),
              image: DecorationImage(
                image: NetworkImage(widget.errorCode.images[index]),
                fit: BoxFit.cover,
              ),
              border: Border.all(
                color: AppColors.textSecondary.withValues(alpha: 0.2),
              ),
            ),
            child: Align(
              alignment: Alignment.bottomRight,
              child: Padding(
                padding: const EdgeInsets.all(8.0),
                child: Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 8,
                    vertical: 4,
                  ),
                  decoration: BoxDecoration(
                    color: Colors.black54,
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Text(
                    "Hình ${index + 1}/${widget.errorCode.images.length}",
                    style: const TextStyle(color: Colors.white, fontSize: 10),
                  ),
                ),
              ),
            ),
          );
        },
      ),
    );
  }

  Widget _buildInfoSection(String title, IconData icon, String content) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            Icon(icon, size: 20, color: AppColors.textSecondary),
            const Gap(8),
            Text(
              title.toUpperCase(),
              style: const TextStyle(
                color: AppColors.textSecondary,
                fontSize: 12,
                fontWeight: FontWeight.bold,
              ),
            ),
          ],
        ),
        const Gap(8),
        Container(
          width: double.infinity,
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: AppColors.surface,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: Colors.white10),
          ),
          child: Text(
            content,
            style: const TextStyle(color: Colors.white, height: 1.5),
          ),
        ),
      ],
    );
  }

  Widget _buildTagsSection(
    String title,
    IconData icon,
    List<String> items,
    Color color,
  ) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            Icon(icon, size: 20, color: AppColors.textSecondary),
            const Gap(8),
            Text(
              title.toUpperCase(),
              style: const TextStyle(
                color: AppColors.textSecondary,
                fontSize: 12,
                fontWeight: FontWeight.bold,
              ),
            ),
          ],
        ),
        const Gap(8),
        Wrap(
          spacing: 8,
          runSpacing: 8,
          children: items
              .map(
                (item) => Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 12,
                    vertical: 6,
                  ),
                  decoration: BoxDecoration(
                    color: color.withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(color: color.withValues(alpha: 0.3)),
                  ),
                  child: Text(
                    item,
                    style: TextStyle(color: color, fontWeight: FontWeight.w500),
                  ),
                ),
              )
              .toList(),
        ),
      ],
    );
  }

  Widget _buildStepsSection() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            const Icon(
              Icons.format_list_numbered,
              size: 20,
              color: AppColors.textSecondary,
            ),
            const Gap(8),
            Text(
              'QUY TRÌNH XỬ LÝ',
              style: const TextStyle(
                color: AppColors.textSecondary,
                fontSize: 12,
                fontWeight: FontWeight.bold,
              ),
            ),
          ],
        ),
        const Gap(12),
        const Gap(12),
        ...widget.errorCode.steps.asMap().entries.map((entry) {
          final idx = entry.key + 1;
          final step = entry.value;
          return Padding(
            padding: const EdgeInsets.only(bottom: 12),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Container(
                  width: 24,
                  height: 24,
                  alignment: Alignment.center,
                  decoration: BoxDecoration(
                    color: AppColors.surface,
                    shape: BoxShape.circle,
                    border: Border.all(color: Colors.white24),
                  ),
                  child: Text(
                    "$idx",
                    style: const TextStyle(
                      color: Colors.white,
                      fontWeight: FontWeight.bold,
                      fontSize: 12,
                    ),
                  ),
                ),
                const Gap(12),
                Expanded(
                  child: Text(
                    step,
                    style: const TextStyle(color: Colors.white, height: 1.4),
                  ),
                ),
              ],
            ),
          );
        }),
      ],
    );
  }

  // Extract YouTube video ID from URL
  String? _getYouTubeVideoId(String url) {
    final regExp = RegExp(
      r'^.*(?:youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*',
      caseSensitive: false,
    );
    final match = regExp.firstMatch(url);
    if (match != null && match.groupCount >= 1) {
      return match.group(1);
    }
    return null;
  }

  Widget _buildVideosSection(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            const Icon(
              Icons.play_circle_outline,
              size: 20,
              color: AppColors.textSecondary,
            ),
            const Gap(8),
            const Text(
              'VIDEO HƯỚNG DẪN',
              style: TextStyle(
                color: AppColors.textSecondary,
                fontSize: 12,
                fontWeight: FontWeight.bold,
              ),
            ),
          ],
        ),
        const Gap(12),
        const Gap(12),
        ...widget.errorCode.videos.asMap().entries.map((entry) {
          final idx = entry.key + 1;
          final videoUrl = entry.value;
          final videoId = _getYouTubeVideoId(videoUrl);
          final thumbnailUrl = videoId != null
              ? 'https://img.youtube.com/vi/$videoId/mqdefault.jpg'
              : null;

          return Padding(
            padding: const EdgeInsets.only(bottom: 12),
            child: GestureDetector(
              onTap: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (context) => VideoPlayerScreen(
                      videoUrl: videoUrl,
                      title: 'Video $idx',
                    ),
                  ),
                );
              },
              child: Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: AppColors.surface,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: Colors.white10),
                ),
                child: Row(
                  children: [
                    // Thumbnail
                    Container(
                      width: 100,
                      height: 56,
                      decoration: BoxDecoration(
                        borderRadius: BorderRadius.circular(8),
                        color: Colors.black,
                        image: thumbnailUrl != null
                            ? DecorationImage(
                                image: NetworkImage(thumbnailUrl),
                                fit: BoxFit.cover,
                              )
                            : null,
                      ),
                      child: const Center(
                        child: Icon(
                          Icons.play_circle_filled,
                          color: Colors.red,
                          size: 36,
                        ),
                      ),
                    ),
                    const Gap(12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'Video $idx',
                            style: const TextStyle(
                              color: Colors.white,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          const Gap(4),
                          Text(
                            'Nhấn để xem trên YouTube',
                            style: TextStyle(
                              color: AppColors.textSecondary,
                              fontSize: 12,
                            ),
                          ),
                        ],
                      ),
                    ),
                    const Icon(
                      Icons.open_in_new,
                      color: AppColors.textSecondary,
                      size: 20,
                    ),
                  ],
                ),
              ),
            ),
          );
        }),
      ],
    );
  }

  Widget _buildBottomAction(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: const BoxDecoration(
        color: AppColors.background,
        border: Border(top: BorderSide(color: Color(0xFF1E293B))),
      ),
      child: SizedBox(
        width: double.infinity,
        height: 50,
        child: ElevatedButton(
          onPressed: () {
            Navigator.push(
              context,
              MaterialPageRoute(
                builder: (context) =>
                    TroubleshootScreen(errorCode: widget.errorCode),
              ),
            );
          },
          style: ElevatedButton.styleFrom(
            backgroundColor: const Color(0xFF136DEC),
            foregroundColor: Colors.white,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(12),
            ),
          ),
          child: const Text(
            'Bắt đầu quy trình kiểm tra',
            style: TextStyle(fontWeight: FontWeight.bold),
          ),
        ),
      ),
    );
  }
}
