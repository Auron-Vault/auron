// polyfills.js - Load this FIRST before anything else

// Process polyfill MUST come first
import process from 'process/browser';
global.process = process;
if (!global.process.env) {
  global.process.env = {};
}
global.process.version = 'v16.0.0';
global.process.browser = true;

// Get random values polyfill
import 'react-native-get-random-values';

// Buffer polyfill
import { Buffer } from 'buffer';
global.Buffer = Buffer;

// Stream polyfill
import { Readable } from 'readable-stream';
if (typeof global.stream === 'undefined') {
  global.stream = { Readable };
}

// Events polyfill
import EventEmitter from 'events';
if (typeof global.EventEmitter === 'undefined') {
  global.EventEmitter = EventEmitter;
}

// Util polyfill
import util from 'util';
if (typeof global.util === 'undefined') {
  global.util = util;
}

// Assert polyfill
import assert from 'assert';
if (typeof global.assert === 'undefined') {
  global.assert = assert;
}

// TextEncoder/TextDecoder polyfill
import { TextEncoder, TextDecoder } from 'fast-text-encoding';
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Crypto polyfill - must come after process
import { install } from 'react-native-quick-crypto';
install();
import { crypto } from 'react-native-quick-crypto';
global.crypto = crypto;

// Additional global shims
if (typeof global.__dirname === 'undefined') global.__dirname = '/';
if (typeof global.__filename === 'undefined') global.__filename = '';
if (typeof global.setImmediate === 'undefined') {
  global.setImmediate = (fn, ...args) => setTimeout(fn, 0, ...args);
}

// Location polyfill
if (typeof global.location === 'undefined') {
  global.location = {
    protocol: 'https:',
    host: 'localhost',
  };
}

// atob/btoa polyfills
if (typeof global.atob === 'undefined') {
  global.atob = str => Buffer.from(str, 'base64').toString('binary');
}
if (typeof global.btoa === 'undefined') {
  global.btoa = str => Buffer.from(str, 'binary').toString('base64');
}
