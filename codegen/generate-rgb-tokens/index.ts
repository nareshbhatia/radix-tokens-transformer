import { transformDesignTokenFile } from './transform';
import type { DesignTokensFile } from './types';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import path from 'path';

const srcFiles = [
  'tokens-w3c/theme/theme.twilight.tokens.json',
  'tokens-w3c/semantic/semantic.tokens.json',
];

const dstFile = 'tokens-w3c/semantic/rgb-colors.tokens.json';

try {
  // Ensure destination directory exists
  const destDir = path.dirname(dstFile);
  if (!existsSync(destDir)) {
    mkdirSync(destDir, { recursive: true });
  }

  let legacyTokens = {};

  for (const src of srcFiles) {
    const srcFile = JSON.parse(readFileSync(src, 'utf-8')) as DesignTokensFile;

    legacyTokens = { ...legacyTokens, ...transformDesignTokenFile(srcFile) };
  }

  // Write the output file
  // eslint-disable-next-line no-restricted-syntax
  writeFileSync(dstFile, `${JSON.stringify(legacyTokens, null, 2)}\n`);
} catch (error) {
  console.error('Error during transformation:', error);
  process.exit(1);
}
