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
      crypto: require.resolve('react-native-quick-crypto'),
      process: require.resolve('process/browser'),
      buffer: require.resolve('buffer'),
      events: require.resolve('events'),
      util: require.resolve('util'),
      assert: require.resolve('assert'),
    },
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
