#!/usr/bin/env node
/**
 * Patches rollup to use WASM bindings instead of native bindings.
 * This is needed when native .node binaries can't be loaded due to code signing.
 */
import { cpSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

const wasmNativeSrc = resolve(root, 'node_modules/@rollup/wasm-node/dist/native.js');
const wasmDirSrc = resolve(root, 'node_modules/@rollup/wasm-node/dist/wasm-node');
const rollupNativeDest = resolve(root, 'node_modules/rollup/dist/native.js');
const rollupWasmDirDest = resolve(root, 'node_modules/rollup/dist/wasm-node');

if (existsSync(wasmNativeSrc) && existsSync(wasmDirSrc)) {
  cpSync(wasmNativeSrc, rollupNativeDest);
  cpSync(wasmDirSrc, rollupWasmDirDest, { recursive: true });
  console.log('✓ Patched rollup to use WASM bindings');
} else {
  console.log('⚠ @rollup/wasm-node not found, skipping patch');
}
