import StyleDictionary from "style-dictionary";

const COLOR_MODES = ["light", "dark"];

for (const colorMode of COLOR_MODES) {
  const config = {
    source: [
        "tokens/primitives/**/*.json",
        "tokens/theme/**/*.json",
        "tokens/semantic/**/*.json",
        `tokens/color-mode/color-mode.${colorMode}.tokens.json`,
      ],
      platforms: {
        css: {
          transformGroup: "css",
          buildPath: "build/css/",
          files: [
            {
              destination: `standard.${colorMode}.css`,
              format: "css/variables",
            },
          ],
        },
      },
    }

  const sd = new StyleDictionary(config);
  await sd.hasInitialized;
  await sd.buildAllPlatforms();
}
