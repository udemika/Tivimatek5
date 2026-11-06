const { withAndroidManifest, withMainActivity } = require("@expo/config-plugins");

function withGoogleTVManifest(config) {
  return withAndroidManifest(config, (cfg) => {
    const manifest = cfg.modResults.manifest;
    manifest.$ = manifest.$ || {};

    // Declare Leanback & non-required Touchscreen so Google TV / Android TV accepts the APK
    manifest["uses-feature"] = manifest["uses-feature"] || [];
    const ensureFeature = (name, required = "false") => {
      const existing = manifest["uses-feature"].find((f) => f.$ && f.$["android:name"] === name);
      if (existing) {
        existing.$["android:required"] = required;
      } else {
        manifest["uses-feature"].push({
          $: { "android:name": name, "android:required": required },
        });
      }
    };
    ensureFeature("android.software.leanback", "false");
    ensureFeature("android.hardware.touchscreen", "false");
    ensureFeature("android.hardware.faketouch", "false");

    const app = manifest.application && manifest.application[0];
    if (app) {
      app.$ = app.$ || {};
      // Allow HTTP Stalker portals, Xtream Codes & MPEG-TS / HLS streams
      app.$["android:usesCleartextTraffic"] = "true";
      app.$["android:banner"] = "@mipmap/ic_launcher";

      if (Array.isArray(app.activity)) {
        for (const act of app.activity) {
          if (act.$ && (act.$["android:name"] === ".MainActivity" || act.$["android:name"]?.endsWith(".MainActivity"))) {
            act.$["android:screenOrientation"] = "sensorLandscape";
            act.$["android:configChanges"] =
              "keyboard|keyboardHidden|orientation|screenSize|screenLayout|uiMode|navigation";
            act["intent-filter"] = act["intent-filter"] || [];
            const hasLeanback = act["intent-filter"].some((f) =>
              (f.category || []).some((c) => c.$ && c.$["android:name"] === "android.intent.category.LEANBACK_LAUNCHER")
            );
            if (!hasLeanback) {
              act["intent-filter"].push({
                action: [{ $: { "android:name": "android.intent.action.MAIN" } }],
                category: [{ $: { "android:name": "android.intent.category.LEANBACK_LAUNCHER" } }],
              });
            }
          }
        }
      }
    }
    return cfg;
  });
}

function withGoogleTVMainActivity(config) {
  return withMainActivity(config, (cfg) => {
    let src = cfg.modResults.contents;
    if (!src.includes("onTVKeyEvent")) {
      if (!src.includes("import android.view.KeyEvent")) {
        src = src.replace(
          /import android\.os\.Bundle/,
          "import android.os.Bundle\nimport android.view.KeyEvent\nimport com.facebook.react.modules.core.DeviceEventManagerModule"
        );
      }
      const dispatchMethod = `
  override fun dispatchKeyEvent(event: KeyEvent): Boolean {
    if (event.action == KeyEvent.ACTION_DOWN) {
      val keyName = when (event.keyCode) {
        KeyEvent.KEYCODE_DPAD_UP -> "up"
        KeyEvent.KEYCODE_DPAD_DOWN -> "down"
        KeyEvent.KEYCODE_DPAD_LEFT -> "left"
        KeyEvent.KEYCODE_DPAD_RIGHT -> "right"
        KeyEvent.KEYCODE_DPAD_CENTER, KeyEvent.KEYCODE_ENTER, KeyEvent.KEYCODE_NUMPAD_ENTER -> "select"
        KeyEvent.KEYCODE_MEDIA_PLAY_PAUSE, KeyEvent.KEYCODE_MEDIA_PLAY, KeyEvent.KEYCODE_MEDIA_PAUSE -> "playPause"
        KeyEvent.KEYCODE_CHANNEL_UP, KeyEvent.KEYCODE_PAGE_UP -> "channelUp"
        KeyEvent.KEYCODE_CHANNEL_DOWN, KeyEvent.KEYCODE_PAGE_DOWN -> "channelDown"
        KeyEvent.KEYCODE_MENU, KeyEvent.KEYCODE_GUIDE, KeyEvent.KEYCODE_INFO -> "menu"
        KeyEvent.KEYCODE_MEDIA_REWIND -> "rewind"
        KeyEvent.KEYCODE_MEDIA_FAST_FORWARD -> "fastForward"
        else -> null
      }
      if (keyName != null) {
        try {
          val reactInstanceManager = reactNativeHost.reactInstanceManager
          val reactContext = reactInstanceManager.currentReactContext
          reactContext?.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
            ?.emit("onTVKeyEvent", keyName)
        } catch (_: Exception) {}
      }
    }
    return super.dispatchKeyEvent(event)
  }
`;
      const lastBrace = src.lastIndexOf("}");
      if (lastBrace !== -1) {
        src = src.slice(0, lastBrace) + dispatchMethod + "\n}\n";
      }
    }
    cfg.modResults.contents = src;
    return cfg;
  });
}

module.exports = function withGoogleTV(config) {
  config = withGoogleTVManifest(config);
  config = withGoogleTVMainActivity(config);
  return config;
};
