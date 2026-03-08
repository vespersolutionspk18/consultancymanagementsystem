// Entry point for pkg binary builds
// This file runs BEFORE any imports to polyfill APIs missing in Node 18
'use strict';

// Polyfill crypto.getRandomValues for pkg's Node 18 runtime
// (needed by uuid and other packages bundled in cms-shared)
const { webcrypto } = require('crypto');

if (!globalThis.crypto) {
  globalThis.crypto = webcrypto;
} else if (!globalThis.crypto.getRandomValues) {
  globalThis.crypto.getRandomValues =
    webcrypto.getRandomValues.bind(webcrypto);
}

// Now load the actual main module (all its imports will see the polyfilled crypto)
require('./main');
