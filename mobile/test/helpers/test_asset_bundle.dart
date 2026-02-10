import 'package:flutter/services.dart';

// Helper class to mock asset loading
class TestAssetBundle extends CachingAssetBundle {
  @override
  Future<String> loadString(String key, {bool cache = true}) async {
    return ""; // Return empty string for text assets
  }

  @override
  Future<ByteData> load(String key) async {
    if (key == 'AssetManifest.json' ||
        key == 'FontManifest.json' ||
        key.endsWith('.ttf')) {
      return rootBundle.load(key);
    }

    // Return empty transparent 1x1 png for images
    final Uint8List transparentImage = Uint8List.fromList(<int>[
      0x0A,
      0x00,
      0x00,
      0x00,
      0x0D,
      0x49,
      0x48,
      0x44,
      0x52,
      0x00,
      0x00,
      0x00,
      0x01,
      0x00,
      0x00,
      0x00,
      0x01,
      0x08,
      0x06,
      0x00,
      0x00,
      0x00,
      0x1F,
      0x15,
      0xC4,
      0x89,
      0x00,
      0x00,
      0x00,
      0x0A,
      0x49,
      0x44,
      0x41,
      0x54,
      0x78,
      0x9C,
      0x63,
      0x00,
      0x01,
      0x00,
      0x00,
      0x05,
      0x00,
      0x01,
      0x0D,
      0x0A,
      0x2D,
      0xB4,
      0x00,
      0x00,
      0x00,
      0x00,
      0x49,
      0x45,
      0x4E,
      0x44,
      0xAE,
      0x42,
      0x60,
      0x82,
    ]);
    return ByteData.view(transparentImage.buffer);
  }
}
