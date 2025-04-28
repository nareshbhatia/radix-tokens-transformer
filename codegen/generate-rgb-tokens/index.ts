import { transformDesignTokenFile } from './transform.js';
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

  const rgbTokens: DesignTokensFile = {};

  for (const src of srcFiles) {
    const srcFile = JSON.parse(readFileSync(src, 'utf-8')) as DesignTokensFile;
    const transformedTokens = transformDesignTokenFile(srcFile);

    // Merge at the second level within Color group
    if (
      transformedTokens.Color !== undefined &&
      transformedTokens.Color !== null
    ) {
      if (rgbTokens.Color === undefined || rgbTokens.Color === null) {
        rgbTokens.Color = {};
      }
      // Merge each color group from the transformed tokens
      for (const [colorGroup, colorTokens] of Object.entries(
        transformedTokens.Color,
      )) {
        if (
          rgbTokens.Color[colorGroup] === undefined ||
          rgbTokens.Color[colorGroup] === null
        ) {
          rgbTokens.Color[colorGroup] = {};
        }
        // Merge the tokens within this color group
        rgbTokens.Color[colorGroup] = {
          ...rgbTokens.Color[colorGroup],
          ...colorTokens,
        };
      }
    }
  }

  // Write the output file
  // eslint-disable-next-line no-restricted-syntax
  writeFileSync(dstFile, `${JSON.stringify(rgbTokens, null, 2)}\n`);
} catch (error) {
  console.error('Error during transformation:', error);
  process.exit(1);
}
