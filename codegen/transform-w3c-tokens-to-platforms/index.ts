import StyleDictionary from 'style-dictionary';
import { transformTypes } from 'style-dictionary/enums';

enum Platform {
  Corporate = 'corporate',
  Twilight = 'twilight',
  Velvet = 'velvet',
}

enum ColorMode {
  Light = 'light',
  Dark = 'dark',
}

const TRANSFORM_COLOR_RGB_COMMA_SEPARATED = 'color/rgb-comma-separated';
const FILTER_REMOVE_PRIMITIVES = 'filter-remove-primitives';
const FILTER_FOR_JAVASCRIPT_OUTPUT = 'filter-for-javascript-output';

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

/*
 * Filter for CSS output
 *   - remove primitive tokens except for the dimension tokens
 */
StyleDictionary.registerFilter({
  name: FILTER_REMOVE_PRIMITIVES,
  filter: (token) =>
    token.name.includes('dimension') ||
    (!token.filePath.startsWith('tokens-w3c/color-mode') &&
      !token.filePath.startsWith('tokens-w3c/primitives')),
});

/*
 * Filter for JavaScript output:
 *   - remove color tokens with `Rgb` suffix
 *   - remove primitive tokens
 */
StyleDictionary.registerFilter({
  name: FILTER_FOR_JAVASCRIPT_OUTPUT,
  filter: (token) =>
    token.$type === 'color' &&
    !token.name.endsWith('Rgb') &&
    !token.filePath.startsWith('tokens-w3c/color-mode') &&
    !token.filePath.startsWith('tokens-w3c/primitives'),
});

for (const platform of Object.values(Platform)) {
  for (const colorMode of Object.values(ColorMode)) {
    const config = {
      source: [
        `tokens-w3c/primitives/primitives.${platform}.tokens.json`,
        `tokens-w3c/theme/theme.${platform}.tokens.json`,
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
              destination: `${platform}.${colorMode}.css`,
              format: 'css/variables',
              filter: FILTER_REMOVE_PRIMITIVES,
            },
          ],
          prefix: 'rt',
        },
        ts: {
          transformGroup: 'js',
          buildPath: 'src/ts/',
          files: [
            {
              destination: `${platform}.${colorMode}.ts`,
              format: 'javascript/es6',
              filter: FILTER_FOR_JAVASCRIPT_OUTPUT,
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
