// index.js

// Polyfills must be imported first
import 'react-native-gesture-handler';
import 'react-native-get-random-values';

// Explicitly polyfill crypto
import { crypto } from 'react-native-quick-crypto';
if (typeof global.crypto === 'undefined') {
  global.crypto = crypto;
}

import { Buffer } from 'buffer';
if (typeof global.Buffer === 'undefined') {
  global.Buffer = Buffer;
}

import { AppRegistry } from 'react-native';
import App from './App'; // Pastikan ini menunjuk ke App.tsx baru
import { name as appName } from './app.json';

AppRegistry.registerComponent(appName, () => App);
