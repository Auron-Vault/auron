// index.js

// Load all polyfills FIRST - this must be the very first import
import './polyfills';

// React Native gesture handler
import 'react-native-gesture-handler';

import { AppRegistry } from 'react-native';
import App from './App';

AppRegistry.registerComponent('auron', () => App);
