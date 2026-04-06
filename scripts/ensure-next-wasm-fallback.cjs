const fs = require('fs');
const path = require('path');

const sourceDir = path.join(__dirname, '..', 'node_modules', '@next', 'swc-wasm-nodejs');
const targetDir = path.join(__dirname, '..', 'node_modules', 'next', 'wasm', '@next', 'swc-wasm-nodejs');

if (!fs.existsSync(sourceDir)) {
  process.exit(0);
}

fs.mkdirSync(targetDir, { recursive: true });

for (const entry of fs.readdirSync(sourceDir)) {
  const sourcePath = path.join(sourceDir, entry);
  const targetPath = path.join(targetDir, entry);
  fs.copyFileSync(sourcePath, targetPath);
}
