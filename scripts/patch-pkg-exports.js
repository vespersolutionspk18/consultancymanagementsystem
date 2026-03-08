#!/usr/bin/env node
/**
 * Patches node_modules packages for pkg compatibility.
 *
 * Problem: pkg follows the `main` field in package.json, but many packages
 * have `main` pointing to ESM while `exports['.'].require` points to CJS.
 * At runtime in the pkg binary, Node.js uses the `require` condition,
 * which tries to load a file that pkg didn't include.
 *
 * Solution: Patch `main` to match the `require` entry in `exports`.
 */
'use strict';

const fs = require('fs');
const path = require('path');

const nodeModulesDir = path.resolve(__dirname, '..', 'node_modules');
let patchCount = 0;

function patchPackage(pkgJsonPath) {
  try {
    const raw = fs.readFileSync(pkgJsonPath, 'utf8');
    const pkg = JSON.parse(raw);

    if (!pkg.exports || typeof pkg.exports !== 'object') return;

    const mainExport = pkg.exports['.'];
    if (!mainExport || typeof mainExport !== 'object') return;

    let requireEntry = mainExport.require;
    if (!requireEntry) return;

    // Handle nested conditional exports: { require: { default: "./path" } }
    if (typeof requireEntry === 'object') {
      requireEntry = requireEntry.default || requireEntry.node || Object.values(requireEntry)[0];
    }
    if (typeof requireEntry !== 'string') return;

    const currentMain = pkg.main;
    if (currentMain === requireEntry) return; // Already correct

    // Only patch if the require entry actually exists
    const requirePath = path.resolve(path.dirname(pkgJsonPath), requireEntry);
    if (!fs.existsSync(requirePath)) return;

    // Patch the main field
    pkg.main = requireEntry;
    fs.writeFileSync(pkgJsonPath, JSON.stringify(pkg, null, 2) + '\n');
    patchCount++;
    console.log(`  Patched ${pkg.name}: main ${currentMain} -> ${requireEntry}`);
  } catch (e) {
    // Skip packages we can't parse
  }
}

function walkNodeModules(dir, depth) {
  if (depth > 3) return;

  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      if (entry.name.startsWith('.')) continue;

      const fullPath = path.join(dir, entry.name);

      if (entry.name.startsWith('@')) {
        // Scoped package - go one level deeper
        walkNodeModules(fullPath, depth);
        continue;
      }

      const pkgJsonPath = path.join(fullPath, 'package.json');
      if (fs.existsSync(pkgJsonPath)) {
        patchPackage(pkgJsonPath);
      }

      // Check for nested node_modules
      const nestedNm = path.join(fullPath, 'node_modules');
      if (fs.existsSync(nestedNm)) {
        walkNodeModules(nestedNm, depth + 1);
      }
    }
  } catch (e) {
    // Skip directories we can't read
  }
}

console.log('Patching node_modules for pkg compatibility...');
walkNodeModules(nodeModulesDir, 0);
console.log(`Done! Patched ${patchCount} packages.`);
