#!/usr/bin/env node
/**
 * Build a single-file bundle for Node.js SEA (Single Executable Application).
 *
 * Key difference from regular esbuild: SEA can only use built-in Node.js modules.
 * All external packages must be either bundled or stubbed (empty module).
 */
'use strict';

const esbuild = require('esbuild');
const fs = require('fs');
const path = require('path');

// Modules that should be stubbed (empty module) rather than bundled.
// These are optional dependencies that aren't needed at runtime in desktop mode.
const STUB_MODULES = [
  // NestJS optional framework modules
  '@nestjs/microservices', '@nestjs/websockets',
  '@nestjs/mongoose', '@nestjs/sequelize', '@nestjs/sequelize/*',
  '@mikro-orm/core',
  // Fastify (not used - we use Express)
  '@fastify/static', '@fastify/view', 'fastify',
  // Build tools (not needed at runtime)
  'esbuild', 'lightningcss', '@swc/core', '@swc/wasm', 'ts-morph',
  // Apollo Federation (not used)
  '@apollo/subgraph', '@apollo/subgraph/*',
  // Test mocks
  'mock-aws-s3', 'aws-sdk', 'nock',
  // Optional native modules (JS fallbacks exist or not needed)
  'pg-native', 'cpu-features', 'ssh2',
  'bufferutil', 'utf-8-validate',
  'canvas', '@napi-rs/canvas',
  '@sentry-internal/node-cpu-profiler',
  'fsevents',
  // Class transformer storage
  'class-transformer/storage',
  // Sharp (we provide a stub)
  'sharp',
];

// Create a plugin that stubs out unwanted modules
const stubPlugin = {
  name: 'stub-modules',
  setup(build) {
    // For each stub module, resolve to a virtual empty module
    const stubFilter = new RegExp(
      '^(' + STUB_MODULES.map(m => m.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|') + ')(/.*)?$'
    );

    build.onResolve({ filter: stubFilter }, args => {
      return { path: args.path, namespace: 'stub' };
    });

    build.onLoad({ filter: /.*/, namespace: 'stub' }, (args) => {
      // For pg-native and other modules that need to trigger a "not found" fallback,
      // throw an error so the calling code falls back to the JS implementation.
      const throwModules = ['pg-native', 'cpu-features', 'ssh2', 'bufferutil', 'utf-8-validate', 'fsevents'];
      if (throwModules.some(m => args.path === m || args.path.startsWith(m + '/'))) {
        return {
          contents: `throw new Error("Module '${args.path}' not available in SEA mode");`,
          loader: 'js',
        };
      }
      // NestJS optional modules are loaded via optionalRequire() which catches errors
      // and returns {}. Destructuring { Module } from {} gives undefined, so
      // `Module && new Module()` short-circuits. We must THROW (not return undefined)
      // so optionalRequire's catch block runs and returns {}.
      const optionalNestModules = [
        '@nestjs/microservices', '@nestjs/websockets',
        '@nestjs/mongoose', '@nestjs/sequelize',
        '@mikro-orm/core',
        '@apollo/subgraph',
      ];
      if (optionalNestModules.some(m => args.path === m || args.path.startsWith(m + '/'))) {
        return {
          contents: `throw new Error("Module '${args.path}' not available in SEA mode");`,
          loader: 'js',
        };
      }
      return {
        contents: 'module.exports = new Proxy({}, { get: () => () => {} });',
        loader: 'js',
      };
    });
  },
};

// Build (async because plugins require the async API)
async function build() {
  await esbuild.build({
    entryPoints: [path.resolve(__dirname, '..', 'dist', 'main.js')],
    bundle: true,
    platform: 'node',
    format: 'cjs',
    target: 'node20',
    outfile: path.resolve(__dirname, '..', 'dist', 'bundled.js'),
    alias: {
      'bcrypt': 'bcryptjs',
    },
    plugins: [stubPlugin],
    loader: { '.node': 'empty' },
    logLevel: 'warning',
    minify: false,
    sourcemap: false,
    banner: {
      js: [
        '// Polyfill crypto.getRandomValues for Node 20 SEA runtime',
        'const { webcrypto: _wc } = require("crypto");',
        'if (!globalThis.crypto) globalThis.crypto = _wc;',
        'else if (!globalThis.crypto.getRandomValues) globalThis.crypto.getRandomValues = _wc.getRandomValues.bind(_wc);',
      ].join('\n')
    }
  });

  // Post-process: fix esbuild __commonJS caching bug for pg-native.
  // When a __commonJS-wrapped module throws, the cached `mod.exports = {}` persists,
  // so the second call returns {} instead of re-throwing. This causes TypeORM to
  // think pg-native loaded successfully and try `new Native({})` which fails.
  // Fix: replace all require_pg_native() calls with null so callers get null directly.
  const bundledPath = path.resolve(__dirname, '..', 'dist', 'bundled.js');
  let code = fs.readFileSync(bundledPath, 'utf8');
  const pgNativeCount = (code.match(/require_pg_native\(\)/g) || []).length;
  code = code.replace(/require_pg_native\(\)/g, 'null');
  fs.writeFileSync(bundledPath, code);
  console.log('Post-process: replaced ' + pgNativeCount + ' require_pg_native() calls with null');

  const stats = fs.statSync(bundledPath);
  console.log('Bundle created: ' + (stats.size / 1024 / 1024).toFixed(1) + 'MB');
}

build().catch(err => {
  console.error(err);
  process.exit(1);
});
