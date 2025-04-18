import StyleDictionary from "style-dictionary";

const sd = new StyleDictionary({
  "source": [
    "tokens/primitives/**/*.json",
    "tokens/theme/**/*.json",
    "tokens/semantic/**/*.json",
    "tokens/color-mode/color-mode.light.tokens.json"
  ],
  "platforms": {
    "css-light": {
      "transformGroup": "css",
      "buildPath": "build/css/",
      "files": [
        {
          "destination": "standard.light.css",
          "format": "css/variables"
        }
      ]
    },
    "css-dark": {
      "transformGroup": "css",
      "buildPath": "build/css/",
      "files": [
        {
          "destination": "standard.dark.css",
          "format": "css/variables"
        }
      ]
    }
  }
});

sd.buildAllPlatforms();
