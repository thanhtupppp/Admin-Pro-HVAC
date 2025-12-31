import 'package:firebase_core/firebase_core.dart' show FirebaseOptions;
import 'package:flutter/foundation.dart'
    show defaultTargetPlatform, kIsWeb, TargetPlatform;

/// Default [FirebaseOptions] for use with your Firebase apps.
///
/// Example:
/// ```dart
/// import 'firebase_options.dart';
/// // ...
/// await Firebase.initializeApp(
///   options: DefaultFirebaseOptions.currentPlatform,
/// );
/// ```
class DefaultFirebaseOptions {
  static FirebaseOptions get currentPlatform {
    if (kIsWeb) {
      return web;
    }
    switch (defaultTargetPlatform) {
      case TargetPlatform.android:
        return android;
      case TargetPlatform.iOS:
        return ios;
      case TargetPlatform.macOS:
        throw UnsupportedError(
          'DefaultFirebaseOptions have not been configured for macos - '
          'you can reconfigure this by running the FlutterFire CLI again.',
        );
      case TargetPlatform.windows:
        throw UnsupportedError(
          'DefaultFirebaseOptions have not been configured for windows - '
          'you can reconfigure this by running the FlutterFire CLI again.',
        );
      case TargetPlatform.linux:
        throw UnsupportedError(
          'DefaultFirebaseOptions have not been configured for linux - '
          'you can reconfigure this by running the FlutterFire CLI again.',
        );
      default:
        throw UnsupportedError(
          'DefaultFirebaseOptions are not supported for this platform.',
        );
    }
  }

  static const FirebaseOptions web = FirebaseOptions(
    apiKey: 'AIzaSyAjlwe3zThnEbr6rGHB7YP19-IBHGNcz6I',
    appId: '1:385210564068:web:b5b5f4137727b294991bf1',
    messagingSenderId: '385210564068',
    projectId: 'admin-pro-hvac',
    authDomain: 'admin-pro-hvac.firebaseapp.com',
    storageBucket: 'admin-pro-hvac.firebasestorage.app',
    measurementId: 'G-ZH9567SWGR',
  );

  static const FirebaseOptions android = FirebaseOptions(
    apiKey: 'AIzaSyAjlwe3zThnEbr6rGHB7YP19-IBHGNcz6I',
    appId: '1:385210564068:android:b5b5f4137727b294991bf1',
    messagingSenderId: '385210564068',
    projectId: 'admin-pro-hvac',
    storageBucket: 'admin-pro-hvac.firebasestorage.app',
  );

  static const FirebaseOptions ios = FirebaseOptions(
    apiKey: 'AIzaSyAjlwe3zThnEbr6rGHB7YP19-IBHGNcz6I',
    appId: '1:385210564068:ios:b5b5f4137727b294991bf1',
    messagingSenderId: '385210564068',
    projectId: 'admin-pro-hvac',
    storageBucket: 'admin-pro-hvac.firebasestorage.app',
    iosBundleId: 'com.adminpro.hvac',
  );
}
