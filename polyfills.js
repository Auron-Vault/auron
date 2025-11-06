// polyfills.js - Additional polyfills after react-native-get-random-values
// NOTE: react-native-get-random-values is imported in index.js BEFORE this file

// URL polyfill
import 'react-native-url-polyfill/auto';

// Process polyfill
import process from 'process/browser';
global.process = process;
if (!global.process.env) {
  global.process.env = {};
}
global.process.version = 'v16.0.0';
global.process.browser = true;

// Buffer polyfill
import { Buffer } from 'buffer';
global.Buffer = Buffer;

// Set up btoa/atob first for base64 conversion
if (typeof global.btoa === 'undefined') {
  global.btoa = str => {
    const buffer = Buffer.from(str, 'binary');
    return buffer.toString('base64');
  };
}

if (typeof global.atob === 'undefined') {
  global.atob = str => {
    const buffer = Buffer.from(str, 'base64');
    return buffer.toString('binary');
  };
}

// Add base64 utilities needed by Solana - use native conversion without Buffer methods
global.base64FromArrayBuffer = arrayBuffer => {
  const bytes = new Uint8Array(arrayBuffer);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return global.btoa(binary);
};

global.arrayBufferFromBase64 = base64 => {
  const binary = global.atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
};

// Alias for Solana library compatibility
global.base64ToArrayBuffer = global.arrayBufferFromBase64;
global.arrayBufferToBase64 = global.base64FromArrayBuffer;

// TextEncoder/TextDecoder for @noble libraries
import { TextEncoder, TextDecoder } from 'text-encoding';
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Verify crypto.getRandomValues was set up
if (!global.crypto || !global.crypto.getRandomValues) {
  throw new Error('[Polyfill] crypto.getRandomValues was not set up properly!');
}

// Additional global shims
if (typeof global.__dirname === 'undefined') global.__dirname = '/';
if (typeof global.__filename === 'undefined') global.__filename = '';
if (typeof global.setImmediate === 'undefined') {
  global.setImmediate = (fn, ...args) => setTimeout(fn, 0, ...args);
}
