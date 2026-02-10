import 'package:flutter/material.dart';
import 'package:flutter/services.dart'; // Import SystemChrome
import 'package:gap/gap.dart';
import 'package:youtube_player_iframe/youtube_player_iframe.dart';
import '../../core/constants/app_colors.dart';

class VideoPlayerScreen extends StatefulWidget {
  final String videoUrl;
  final String title;

  const VideoPlayerScreen({
    super.key,
    required this.videoUrl,
    required this.title,
  });

  @override
  State<VideoPlayerScreen> createState() => _VideoPlayerScreenState();
}

class _VideoPlayerScreenState extends State<VideoPlayerScreen> {
  late YoutubePlayerController _controller;
  bool _isValid = true;
  String? _videoId;

  @override
  void initState() {
    super.initState();
    _initPlayer();
  }

  void _initPlayer() {
    // 1. Extract Video ID (Clean manual extraction to avoid dependency on old util)
    _videoId = _extractVideoId(widget.videoUrl);

    if (_videoId == null || _videoId!.isEmpty) {
      if (mounted) {
        setState(() {
          _isValid = false;
        });
      }
      return;
    }

    // 2. Initialize Controller (iframe)
    _controller = YoutubePlayerController.fromVideoId(
      videoId: _videoId!,
      autoPlay: false,
      params: const YoutubePlayerParams(
        showControls: true,
        showFullscreenButton: true,
        strictRelatedVideos: true,
        mute: false,
      ),
    );

    // 3. Listen for fullscreen to handle orientation
    // youtube_player_iframe handles fullscreen logic internally but we can listen to events
    _controller.setFullScreenListener((isFullScreen) {
      if (isFullScreen) {
        SystemChrome.setPreferredOrientations([
          DeviceOrientation.landscapeLeft,
          DeviceOrientation.landscapeRight,
        ]);
        SystemChrome.setEnabledSystemUIMode(SystemUiMode.immersiveSticky);
      } else {
        SystemChrome.setPreferredOrientations(DeviceOrientation.values);
        SystemChrome.setEnabledSystemUIMode(SystemUiMode.edgeToEdge);
      }
    });

    // Verify video loading
    _controller.listen((event) {
      if (event.playerState == PlayerState.playing) {
        debugPrint('✅ IFRAME: Video Playing');
      }
      if (event.hasError) {
        debugPrint('❌ IFRAME ERROR: ${event.error}');
      }
    });
  }

  /// Helper regex to extract ID
  String? _extractVideoId(String url) {
    if (url.trim().isEmpty) return null;
    try {
      // Basic regex for YouTube ID
      RegExp regExp = RegExp(
        r'.*(?:(?:youtu\.be\/|v\/|vi\/|u\/\w\/|embed\/|e\/)|(?:(?:watch)?\?v(?:i)?=|\&v(?:i)?=))([^#\&\?]*).*',
        caseSensitive: false,
        multiLine: false,
      );
      final match = regExp.firstMatch(url)?.group(1);
      return (match != null && match.length == 11) ? match : null;
    } catch (e) {
      debugPrint('Error extracting ID: $e');
      return null;
    }
  }

  @override
  void dispose() {
    // Reset orientation/UI when leaving
    SystemChrome.setPreferredOrientations(DeviceOrientation.values);
    SystemChrome.setEnabledSystemUIMode(SystemUiMode.edgeToEdge);
    _controller.close();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    // 1. Handle Invalid URL
    if (!_isValid) {
      return Scaffold(
        appBar: AppBar(
          title: const Text('Lỗi Video'),
          backgroundColor: AppColors.background,
        ),
        body: const Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(Icons.error_outline, size: 60, color: Colors.amber),
              Gap(16),
              Text(
                'Video không khả dụng',
                style: TextStyle(fontSize: 18, color: Colors.grey),
              ),
              Gap(8),
              Text(
                'Không tìm thấy ID video hợp lệ',
                style: TextStyle(fontSize: 14, color: Colors.grey),
              ),
            ],
          ),
        ),
      );
    }

    // 2. Build Player UI
    return YoutubePlayerScaffold(
      controller: _controller,
      aspectRatio: 16 / 9,
      builder: (context, player) {
        return Scaffold(
          backgroundColor: Colors.black, // Dark background for cinema feel
          appBar: _buildAppBar(context),
          body: LayoutBuilder(
            builder: (context, constraints) {
              return Center(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    player, // The actual iframe player
                    // Optional: Add title/description below if in portrait
                    if (constraints.maxHeight > constraints.maxWidth) ...[
                      const Gap(24),
                      Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 16),
                        child: Text(
                          widget.title,
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 18,
                            fontWeight: FontWeight.bold,
                          ),
                          textAlign: TextAlign.center,
                        ),
                      ),
                    ],
                  ],
                ),
              );
            },
          ),
        );
      },
    );
  }

  AppBar _buildAppBar(BuildContext context) {
    return AppBar(
      backgroundColor: Colors.transparent, // Transparent for overlay feel
      elevation: 0,
      leading: IconButton(
        icon: const Icon(Icons.arrow_back_ios, color: Colors.white),
        onPressed: () => Navigator.of(context).pop(),
      ),
      title: Text(widget.title, style: const TextStyle(color: Colors.white)),
      systemOverlayStyle: SystemUiOverlayStyle.light, // White status bar icons
    );
  }
}
