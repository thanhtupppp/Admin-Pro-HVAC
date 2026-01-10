import 'package:flutter/material.dart';
import 'package:flutter_markdown/flutter_markdown.dart';
import '../../../core/services/legal_service.dart';
import '../../../core/constants/app_colors.dart';

enum LegalType { terms, privacy }

class LegalViewerScreen extends StatefulWidget {
  final LegalType type;

  const LegalViewerScreen({super.key, required this.type});

  @override
  State<LegalViewerScreen> createState() => _LegalViewerScreenState();
}

class _LegalViewerScreenState extends State<LegalViewerScreen> {
  String _content = '';
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadContent();
  }

  Future<void> _loadContent() async {
    final data = await LegalService().fetchLegalContent();
    if (mounted) {
      setState(() {
        _content = widget.type == LegalType.terms
            ? data['terms']!
            : data['privacy']!;
        _isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final title = widget.type == LegalType.terms
        ? 'Điều khoản sử dụng'
        : 'Chính sách bảo mật';

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        title: Text(title, style: const TextStyle(color: Colors.white)),
        leading: IconButton(
          icon: const Icon(Icons.close, color: Colors.white),
          onPressed: () => Navigator.of(context).pop(),
        ),
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : _content.isEmpty
          ? const Center(
              child: Text(
                'Chưa có nội dung',
                style: TextStyle(color: Colors.white70),
              ),
            )
          : Markdown(
              data: _content,
              styleSheet: MarkdownStyleSheet(
                p: const TextStyle(color: Colors.white, fontSize: 16),
                h1: const TextStyle(
                  color: AppColors.primary,
                  fontSize: 24,
                  fontWeight: FontWeight.bold,
                ),
                h2: const TextStyle(
                  color: Colors.white,
                  fontSize: 20,
                  fontWeight: FontWeight.bold,
                ),
                h3: const TextStyle(
                  color: Colors.white,
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                ),
                listBullet: const TextStyle(color: AppColors.primary),
              ),
            ),
    );
  }
}
