#!/bin/bash
set -e

export JAVA_HOME="/opt/homebrew/opt/openjdk@21/libexec/openjdk.jdk/Contents/Home"
export ANDROID_HOME="$HOME/Library/Android/sdk"
export ANDROID_SDK_ROOT="$ANDROID_HOME"

echo "==> Generating static web build..."
cd "$(dirname "$0")/.."
npx nuxi generate

echo "==> Syncing to Android..."
npx cap sync android

echo "==> Building debug APK..."
cd android
./gradlew assembleDebug

APK_PATH="app/build/outputs/apk/debug/app-debug.apk"
if [ -f "$APK_PATH" ]; then
  cp "$APK_PATH" "../wholesale-deal-hub-debug.apk"
  echo ""
  echo "==> APK ready: wholesale-deal-hub-debug.apk ($(du -h "../wholesale-deal-hub-debug.apk" | cut -f1))"
  echo ""
  echo "Install on a connected device:"
  echo "  adb install wholesale-deal-hub-debug.apk"
else
  echo "ERROR: APK not found at $APK_PATH"
  exit 1
fi
