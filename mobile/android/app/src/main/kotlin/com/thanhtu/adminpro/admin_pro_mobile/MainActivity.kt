package com.thanhtu.adminpro.admin_pro_mobile

import android.app.Activity
import android.database.ContentObserver
import android.net.Uri
import android.os.Build
import android.os.Handler
import android.os.Looper
import android.provider.MediaStore
import android.util.Log
import androidx.annotation.NonNull
import io.flutter.embedding.android.FlutterActivity
import io.flutter.embedding.engine.FlutterEngine
import io.flutter.plugin.common.MethodChannel

class MainActivity : FlutterActivity() {
    private val CHANNEL = "com.admin_pro/security"
    
    // API 34 (Android 14) Callback
    private var screenCaptureCallback: Activity.ScreenCaptureCallback? = null
    
    // Fallback ContentObserver
    private var screenshotObserver: ContentObserver? = null

    override fun configureFlutterEngine(@NonNull flutterEngine: FlutterEngine) {
        super.configureFlutterEngine(flutterEngine)

        MethodChannel(flutterEngine.dartExecutor.binaryMessenger, CHANNEL).setMethodCallHandler { call, result ->
            when (call.method) {
                "initialize" -> {
                    setupScreenshotDetection()
                    result.success(null)
                }
                "dispose" -> {
                    removeScreenshotDetection()
                    result.success(null)
                }
                else -> result.notImplemented()
            }
        }
    }

    private fun setupScreenshotDetection() {
        // 1. Try Native API 34+
        if (Build.VERSION.SDK_INT >= 34) {
            Log.d("SecurityService", "Registering Android 14 ScreenCaptureCallback")
            try {
                screenCaptureCallback = Activity.ScreenCaptureCallback {
                    Log.d("SecurityService", "Native ScreenCaptureCallback triggered")
                    reportScreenshot()
                }
                registerScreenCaptureCallback(mainExecutor, screenCaptureCallback!!)
            } catch (e: Exception) {
                Log.e("SecurityService", "Error registering callback: ${e.message}")
            }
        }

        // 2. ALWAYS Register ContentObserver as backup (Samsung/Others might not trigger API 34 callback consistently)
        Log.d("SecurityService", "Registering ContentObserver fallback")
        if (screenshotObserver == null) {
            screenshotObserver = object : ContentObserver(Handler(Looper.getMainLooper())) {
                override fun onChange(selfChange: Boolean, uri: Uri?) {
                    super.onChange(selfChange, uri)
                    if (isScreenshot(uri)) {
                        Log.d("SecurityService", "ContentObserver detected screenshot: $uri")
                        reportScreenshot()
                    }
                }
            }
            
            try {
                 contentResolver.registerContentObserver(
                    MediaStore.Images.Media.EXTERNAL_CONTENT_URI,
                    true,
                    screenshotObserver!!
                )
            } catch (e: Exception) {
                 Log.e("SecurityService", "Error registering ContentObserver: ${e.message}")
            }
        }
    }

    private fun isScreenshot(uri: Uri?): Boolean {
        if (uri == null) return false
        
        // Basic check: Path contains "screenshot"
        val path = uri.toString().lowercase()
        if (path.contains("screenshot")) return true
        
        // Deep check logic could go here (query DB for filename)
        // keeping it simple and fast for now.
        // For accurate file checking, we would query the ContentResolver, but let's see if URI is enough.
        // Often URI is content://media/external/images/media/12345
        
        return try {
            val cursor = contentResolver.query(uri, arrayOf(MediaStore.Images.Media.DISPLAY_NAME, MediaStore.Images.Media.RELATIVE_PATH), null, null, null)
            var isScreen = false
            cursor?.use {
                if (it.moveToFirst()) {
                    val nameIndex = it.getColumnIndex(MediaStore.Images.Media.DISPLAY_NAME)
                    val pathIndex = it.getColumnIndex(MediaStore.Images.Media.RELATIVE_PATH)
                    
                    val name = if (nameIndex >= 0) it.getString(nameIndex) else ""
                    val relativePath = if (pathIndex >= 0) it.getString(pathIndex) else ""
                    
                    if (name.contains("screenshot", true) || relativePath.contains("screenshot", true)) {
                        isScreen = true
                    }
                }
            }
            isScreen
        } catch (e: Exception) {
            false
        }
    }

    private fun removeScreenshotDetection() {
        if (Build.VERSION.SDK_INT >= 34) {
             screenCaptureCallback?.let {
                try {
                    unregisterScreenCaptureCallback(it)
                } catch (e: Exception) { /* ignore */ }
            }
            screenCaptureCallback = null
        }
        
        screenshotObserver?.let {
            try {
                contentResolver.unregisterContentObserver(it)
            } catch (e: Exception) { /* ignore */ }
        }
        screenshotObserver = null
    }

    private var lastReportTime: Long = 0
    private fun reportScreenshot() {
        val now = System.currentTimeMillis()
        if (now - lastReportTime < 1500) {
            // Debounce: Ignore if within 1.5 seconds (avoid double count from both methods)
            return
        }
        lastReportTime = now
        
        runOnUiThread {
            flutterEngine?.dartExecutor?.binaryMessenger?.let {
                 MethodChannel(it, CHANNEL).invokeMethod("onScreenshot", null)
            }
        }
    }
}
