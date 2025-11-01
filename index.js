// index.js

// CRITICAL: react-native-get-random-values MUST be the absolute first import
// See: https://github.com/uuidjs/uuid#getrandomvalues-not-supported
import 'react-native-get-random-values';

// Load all other polyfills
import './polyfills';

// React Native gesture handler
import 'react-native-gesture-handler';

import { AppRegistry } from 'react-native';
import App from './App';

AppRegistry.registerComponent('auron', () => App);
