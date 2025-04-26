import StyleDictionary from "style-dictionary";
import { transformTypes } from "style-dictionary/enums";

const THEMES = ["twilight", "corporate", "velvet"];
const COLOR_MODES = ["light", "dark"];

const TRANSFORM_NAME_MODIFIER_RGB = "name/modifier/rgb";
const TRANSFORM_COLOR_RGB_COMMA_SEPARATED = "color/rgb-comma-separated";

// Returns true if the token is a hex color
function isHexColor(token) {
  return token.$type === "color" && /^#[0-9A-Fa-f]{6}$/.test(token.$value);
}

// Adds "-rgb" suffix to token name if it is a hex color
StyleDictionary.registerTransform({
  name: TRANSFORM_NAME_MODIFIER_RGB,
  type:  transformTypes.name,
  filter: isHexColor,
  transform: (token) => {
    return `${token.name}-rgb`;
  }
});

// Transforms hex colors to rgb colors
StyleDictionary.registerTransform({
  name: TRANSFORM_COLOR_RGB_COMMA_SEPARATED,
  type: transformTypes.value,
  filter: isHexColor,
  transform: (token) => {
    // Convert hex to RGB
    const hex = token.$value.replace("#", "");
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    return `${r}, ${g}, ${b}`;
  },
});

for (const theme of THEMES) {
  for (const colorMode of COLOR_MODES) {
    const config = {
      source: [
        `tokens/primitives/primitives.${theme}.tokens.json`,
        `tokens/theme/theme.${theme}.tokens.json`,
        `tokens/color-mode/color-mode.${colorMode}.tokens.json`,
        "tokens/semantic/**/*.json",
      ],
      platforms: {
        css: {
          transformGroup: "css",
          // transforms: [TRANSFORM_NAME_MODIFIER_RGB, TRANSFORM_COLOR_RGB_COMMA_SEPARATED],
          buildPath: "build/css/",
          files: [
            {
              destination: `${theme}.${colorMode}.css`,
              format: "css/variables",
            },
          ],
          prefix: "rt",
        },
        js: {
          transformGroup: "js",
          buildPath: "build/js/",
          files: [
            {
              destination: `${theme}.${colorMode}.js`,
              format: "javascript/es6",
            },
          ],
        },
      },
    };

    const sd = new StyleDictionary(config, { verbosity: "verbose" });
    await sd.hasInitialized;
    await sd.buildAllPlatforms();
  }
}
