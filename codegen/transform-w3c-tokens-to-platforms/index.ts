import StyleDictionary from 'style-dictionary';
import { transformTypes } from 'style-dictionary/enums';

const THEMES = ['twilight', 'corporate', 'velvet'];
const COLOR_MODES = ['light', 'dark'];

const TRANSFORM_COLOR_RGB_COMMA_SEPARATED = 'color/rgb-comma-separated';
const FILTER_BASE_COLORS = 'filter-base-colors';

/*
 * The `DesignToken` type is defined in Style Dictionary in the file
 * [DesignToken.ts](https://github.com/amzn/style-dictionary/blob/main/types/DesignToken.ts#L18-L33).
 * Here are the relevant parts of this definition, adding parts of the extended `TransformedToken` type:
 *
 * ```typescript
 * export interface DesignToken {
 *   name: string;
 *   $type?: string;
 *   $value?: any;
 *   $description?: string;
 *   comment?: string;
 *   attributes?: Record<string, unknown>;
 *
 *   // Added by `TransformedToken`
 *   path: string[];
 *   original: DesignToken;
 *   filePath: string;
 *   isSource: boolean;
 * }
 * ```
 *
 * Example – Token with normal values:
 *
 * ```json
 * {
 *   "name": "color-slate-1",
 *   "$type": "color",
 *   "$value": "#111113",
 *   "attributes": { category: 'Color', type: 'Slate', item: '1' },
 *
 *   "path": [ 'Color', 'Slate', '1' ]
 *   "original": { '$type': 'color', '$value': '#111113' },
 *   "filePath": 'tokens/color-mode/color-mode.dark.tokens.json',
 *   "isSource": true
 * }
 *
 * Example – Token with referenced value (alias):
 *
 * ```json
 * {
 *   "name": "color-neutral-1",
 *   "$type": "color",
 *   "$value": "#111113",
 *   "attributes": { category: 'Color', type: 'Neutral', item: '1' },
 *
 *   "path": [ 'Color', 'Neutral', '1' ]
 *   "original": { '$type': 'color', '$value': '{Color.Slate.1}' },
 *   "filePath": 'tokens/theme/theme.twilight.tokens.json',
 *   "isSource": true
 * }
 */

// Transforms colors with `-rgb` suffix to rgb colors
StyleDictionary.registerTransform({
  name: TRANSFORM_COLOR_RGB_COMMA_SEPARATED,
  type: transformTypes.value,
  filter: (token) => token.name.endsWith('-rgb'),
  transitive: true,
  transform: (token) => {
    // Check if token.$value is a string and a hex color
    if (
      typeof token.$value === 'string' &&
      /^#[0-9A-F]{6}$/i.test(token.$value)
    ) {
      // Convert hex to RGB
      const hex = token.$value.replace('#', '');
      const r = parseInt(hex.substring(0, 2), 16);
      const g = parseInt(hex.substring(2, 4), 16);
      const b = parseInt(hex.substring(4, 6), 16);
      return `${r}, ${g}, ${b}`;
    }

    // Return the token value as is
    return token.$value as unknown;
  },
});

// Filter tokens of type color and not containing the `Rgb` suffix
StyleDictionary.registerFilter({
  name: FILTER_BASE_COLORS,
  filter: (token) => token.$type === 'color' && !token.name.endsWith('Rgb'),
});

for (const theme of THEMES) {
  for (const colorMode of COLOR_MODES) {
    const config = {
      source: [
        `tokens-w3c/primitives/primitives.${theme}.tokens.json`,
        `tokens-w3c/theme/theme.${theme}.tokens.json`,
        `tokens-w3c/color-mode/color-mode.${colorMode}.tokens.json`,
        'tokens-w3c/semantic/**/*.json',
      ],
      platforms: {
        css: {
          transformGroup: 'css',
          transforms: [TRANSFORM_COLOR_RGB_COMMA_SEPARATED],
          buildPath: 'src/css/',
          files: [
            {
              destination: `${theme}.${colorMode}.css`,
              format: 'css/variables',
            },
          ],
          prefix: 'rt',
        },
        ts: {
          transformGroup: 'js',
          buildPath: 'src/ts/',
          files: [
            {
              destination: `${theme}.${colorMode}.ts`,
              format: 'javascript/es6',
              filter: FILTER_BASE_COLORS,
            },
          ],
        },
      },
    };

    const sd = new StyleDictionary(config, { verbosity: 'verbose' });
    await sd.hasInitialized;
    await sd.buildAllPlatforms();
  }
}
