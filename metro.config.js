const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */
const config = {
  resolver: {
    extraNodeModules: {
      stream: require.resolve('readable-stream'),
      process: require.resolve('process/browser'),
      buffer: require.resolve('buffer'),
      events: require.resolve('events'),
      util: require.resolve('util'),
      assert: require.resolve('assert'),
      // Crypto is handled by polyfills - no need to resolve here
    },
    sourceExts: ['jsx', 'js', 'ts', 'tsx', 'json', 'cjs'],
  },
  transformer: {
    minifierConfig: {
      keep_classnames: true,
      keep_fnames: true,
      mangle: {
        keep_classnames: true,
        keep_fnames: true,
      },
      compress: {
        drop_console: true,
        reduce_funcs: false,
        collapse_vars: false,
      },
    },
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
