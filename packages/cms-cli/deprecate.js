#!/usr/bin/env node
const message = `\nCMS CLI (cms-cli) is deprecated.\n\nPlease install and use the new package instead:\n  npm install -g cms-sdk\n\nThe command name remains the same: \"cms\".\nMore info: https://www.npmjs.com/package/cms-sdk\n`;

console.error(message);
process.exitCode = 1;
