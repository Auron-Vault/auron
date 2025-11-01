# Build Size Optimization Guide

## Applied Optimizations

### 1. **ProGuard Minification** ✅

- Enabled `minifyEnabled = true` in release builds
- Uses `proguard-android-optimize.txt` for maximum optimization
- Custom rules for React Native and Solana libraries

### 2. **Resource Shrinking** ✅

- Enabled `shrinkResources = true`
- Removes unused resources from final APK/AAB
- Works with ProGuard to eliminate dead code

### 3. **Metro Bundler Optimization** ✅

- Console removal in production (`drop_console: true`)
- Function name preservation for debugging
- Disabled aggressive optimizations that break Solana libraries

### 4. **Babel Transform** ✅

- `babel-plugin-transform-remove-console` strips all console.log
- Only applies in production builds
- console.error preserved for error tracking

### 5. **ProGuard Rules** ✅

Added optimizations:

- 5 optimization passes
- Android logging removal (Log.d, Log.v, Log.i)
- Keep React Native classes
- Keep Solana/Web3 classes

## Build Commands

### Development (with logs)

```bash
npm start
npm run android
```

### Production APK (optimized)

```bash
npm run android:release
```

**Output:** `android/app/build/outputs/apk/release/app-release.apk`

### Production AAB (Google Play - smallest)

```bash
npm run android:bundle
```

**Output:** `android/app/build/outputs/bundle/release/app-release.aab`

### iOS Production

```bash
npm run ios:release
```

## Size Comparison

### Before Optimization

- APK: ~107 MB

### After Optimization (Expected)

- APK: ~45-60 MB (50-60% reduction)
- AAB: ~35-45 MB (Google Play will generate optimized APKs per device)
- Per-device download: ~25-35 MB (from Play Store)

## What Gets Removed

1. **Console Statements**: All `console.log()`, `console.warn()`, `console.debug()`
2. **Unused Resources**: Images, layouts, strings not referenced in code
3. **Dead Code**: Unused classes, methods, fields via ProGuard
4. **Debug Info**: Source maps and debug symbols (except crash reporting)
5. **Multiple ABIs**: Play Store delivers only the ABI needed for each device

## What's Preserved

1. **console.error()**: For error tracking in production
2. **Function Names**: For better stack traces
3. **Class Names**: For reflection and debugging
4. **React Native Core**: All RN classes protected
5. **Solana Web3**: All web3 classes protected

## Production Checklist

- [x] ProGuard enabled
- [x] Resource shrinking enabled
- [x] Console removal configured
- [x] Babel plugin installed
- [x] Metro minifier configured
- [x] ProGuard rules optimized
- [ ] Generate production keystore (replace debug.keystore)
- [ ] Update version code and name
- [ ] Test on real devices
- [ ] Verify Solana transfers work
- [ ] Check crash reporting

## Next Steps for Release

1. **Create Production Keystore**:

```bash
keytool -genkeypair -v -storetype PKCS12 -keystore auron-release.keystore -alias auron -keyalg RSA -keysize 2048 -validity 10000
```

2. **Update build.gradle** with production signing config

3. **Build AAB for Play Store**:

```bash
npm run android:bundle
```

4. **Upload to Google Play Console**

## Notes

- AAB (Android App Bundle) is recommended for Play Store
- Play Store generates optimized APKs per device (smaller downloads)
- APK is for direct distribution (larger but universal)
- All optimizations preserve app functionality
- Solana libraries protected from over-optimization
