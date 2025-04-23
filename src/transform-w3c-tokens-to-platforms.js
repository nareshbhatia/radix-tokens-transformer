import StyleDictionary from "style-dictionary";

const THEMES = ["twilight", "corporate", "velvet"];
const COLOR_MODES = ["light", "dark"];

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
          buildPath: "build/css/",
          files: [
            {
              destination: `${theme}.${colorMode}.css`,
              format: "css/variables",
            },
          ],
          prefix: "rt"
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

    const sd = new StyleDictionary(config, { verbosity: 'verbose' });
    await sd.hasInitialized;
    await sd.buildAllPlatforms();
  }
}
