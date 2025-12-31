import 'dart:async';
import 'package:flutter/material.dart';
import 'package:gap/gap.dart';
import '../../../../core/constants/app_colors.dart';

class RecentErrorCard extends StatefulWidget {
  final String code;
  final String brand;
  final String title;
  final String subtitle;
  final String imageUrl;
  final List<String>? images;
  final List<String>? videos;

  const RecentErrorCard({
    super.key,
    required this.code,
    required this.brand,
    required this.title,
    required this.subtitle,
    required this.imageUrl,
    this.images,
    this.videos,
  });

  @override
  State<RecentErrorCard> createState() => _RecentErrorCardState();
}

class _RecentErrorCardState extends State<RecentErrorCard> {
  int _currentIndex = 0;
  Timer? _timer;
  List<String> _mediaList = [];
  List<bool> _isVideoList = [];

  @override
  void initState() {
    super.initState();
    _setupMediaList();
    if (_mediaList.length > 1) {
      _startTimer();
    }
  }

  @override
  void didUpdateWidget(RecentErrorCard oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.images != widget.images ||
        oldWidget.videos != widget.videos ||
        oldWidget.imageUrl != widget.imageUrl) {
      _stopTimer();
      _setupMediaList();
      if (_mediaList.length > 1) {
        _startTimer();
      }
    }
  }

  @override
  void dispose() {
    _stopTimer();
    super.dispose();
  }

  void _setupMediaList() {
    _mediaList = [];
    _isVideoList = [];
    _currentIndex = 0;

    // Add images
    if (widget.images != null && widget.images!.isNotEmpty) {
      for (var img in widget.images!) {
        if (img.isNotEmpty) {
          _mediaList.add(img);
          _isVideoList.add(false);
        }
      }
    }

    // Add videos (thumbnails)
    if (widget.videos != null && widget.videos!.isNotEmpty) {
      for (var video in widget.videos!) {
        final thumbnail = _getYouTubeThumbnail(video);
        if (thumbnail != null) {
          _mediaList.add(thumbnail);
          _isVideoList.add(true);
        }
      }
    }

    // Fallback to single imageUrl if list is empty but imageUrl exists
    if (_mediaList.isEmpty && widget.imageUrl.isNotEmpty) {
      _mediaList.add(widget.imageUrl);
      _isVideoList.add(false);
    }
  }

  void _startTimer() {
    _timer = Timer.periodic(const Duration(seconds: 5), (timer) {
      if (mounted) {
        setState(() {
          _currentIndex = (_currentIndex + 1) % _mediaList.length;
        });
      }
    });
  }

  void _stopTimer() {
    _timer?.cancel();
    _timer = null;
  }

  // Get YouTube thumbnail from video URL
  String? _getYouTubeThumbnail(String? videoUrl) {
    if (videoUrl == null || videoUrl.isEmpty) return null;
    final regExp = RegExp(
      r'^.*(?:youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*',
      caseSensitive: false,
    );
    final match = regExp.firstMatch(videoUrl);
    if (match != null && match.groupCount >= 1) {
      final videoId = match.group(1);
      return 'https://img.youtube.com/vi/$videoId/mqdefault.jpg';
    }
    return null;
  }

  // Get brand color for gradient
  Color _getBrandColor(String brand) {
    final brandLower = brand.toLowerCase();
    if (brandLower.contains('daikin')) {
      return const Color(0xFF00A0E3); // Daikin Blue
    } else if (brandLower.contains('panasonic')) {
      return const Color(0xFF0052A5); // Panasonic Blue
    } else if (brandLower.contains('lg')) {
      return const Color(0xFFA50034); // LG Red
    } else if (brandLower.contains('samsung')) {
      return const Color(0xFF1428A0); // Samsung Blue
    } else if (brandLower.contains('mitsubishi')) {
      return const Color(0xFFE60012); // Mitsubishi Red
    } else if (brandLower.contains('carrier')) {
      return const Color(0xFF005EB8); // Carrier Blue
    } else if (brandLower.contains('toshiba')) {
      return const Color(0xFFFF0000); // Toshiba Red
    }
    return AppColors.primary;
  }

  @override
  Widget build(BuildContext context) {
    final brandColor = _getBrandColor(widget.brand);

    // Determine current display image
    String? currentImage;
    bool isVideo = false;

    if (_mediaList.isNotEmpty) {
      currentImage = _mediaList[_currentIndex];
      isVideo = _isVideoList[_currentIndex];
    }

    return SizedBox(
      width: 160,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Expanded(
            child: AnimatedContainer(
              duration: const Duration(milliseconds: 500),
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(16),
                gradient: currentImage == null
                    ? LinearGradient(
                        begin: Alignment.topLeft,
                        end: Alignment.bottomRight,
                        colors: [
                          brandColor.withValues(alpha: 0.8),
                          brandColor.withValues(alpha: 0.4),
                          AppColors.surface,
                        ],
                      )
                    : null,
                image: currentImage != null
                    ? DecorationImage(
                        image: NetworkImage(currentImage),
                        fit: BoxFit.cover,
                        colorFilter: ColorFilter.mode(
                          Colors.black.withValues(alpha: 0.2),
                          BlendMode.darken,
                        ),
                        onError: (exception, stackTrace) {},
                      )
                    : null,
                boxShadow: [
                  BoxShadow(
                    color: brandColor.withValues(alpha: 0.3),
                    blurRadius: 12,
                    offset: const Offset(0, 4),
                  ),
                ],
              ),
              child: Stack(
                children: [
                  // Gradient overlay
                  Container(
                    decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(16),
                      gradient: LinearGradient(
                        begin: Alignment.bottomCenter,
                        end: Alignment.topCenter,
                        colors: [
                          Colors.black.withValues(alpha: 0.9),
                          Colors.black.withValues(alpha: 0.3),
                          Colors.transparent,
                        ],
                        stops: const [0.0, 0.5, 1.0],
                      ),
                    ),
                  ),

                  // Media Indicator (dots)
                  if (_mediaList.length > 1)
                    Positioned(
                      top: 8,
                      left: 8,
                      child: Row(
                        children: List.generate(
                          _mediaList.length > 5 ? 5 : _mediaList.length,
                          (index) {
                            // Show max 5 dots logic could be added but keep simple for now
                            return Container(
                              margin: const EdgeInsets.only(right: 4),
                              width: 6,
                              height: 6,
                              decoration: BoxDecoration(
                                color:
                                    index ==
                                        _currentIndex %
                                            (_mediaList.length > 5
                                                ? 5
                                                : _mediaList
                                                      .length) // Simplify logic
                                    ? Colors.white
                                    : Colors.white.withValues(alpha: 0.4),
                                shape: BoxShape.circle,
                              ),
                            );
                          },
                        ),
                      ),
                    ),

                  // Video play icon
                  if (isVideo)
                    Positioned(
                      top: 8,
                      right: 8,
                      child: Container(
                        padding: const EdgeInsets.all(6),
                        decoration: BoxDecoration(
                          color: Colors.red.withValues(alpha: 0.9),
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: const Icon(
                          Icons.play_arrow,
                          color: Colors.white,
                          size: 16,
                        ),
                      ),
                    ),

                  // Content
                  Positioned(
                    bottom: 12,
                    left: 12,
                    right: 12,
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 8,
                            vertical: 3,
                          ),
                          decoration: BoxDecoration(
                            color: brandColor.withValues(alpha: 0.8),
                            borderRadius: BorderRadius.circular(6),
                          ),
                          child: Text(
                            widget.brand,
                            style: const TextStyle(
                              color: Colors.white,
                              fontSize: 10,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ),
                        const Gap(6),
                        Text(
                          widget.code,
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 26,
                            fontWeight: FontWeight.bold,
                            letterSpacing: 1,
                            shadows: [
                              Shadow(
                                color: Colors.black54,
                                offset: Offset(1, 1),
                                blurRadius: 2,
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),
          const Gap(8),
          Text(
            widget.title,
            style: const TextStyle(
              color: AppColors.textPrimary,
              fontSize: 14,
              fontWeight: FontWeight.w600,
            ),
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
          Text(
            widget.subtitle,
            style: const TextStyle(
              color: AppColors.textSecondary,
              fontSize: 12,
            ),
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
        ],
      ),
    );
  }
}
