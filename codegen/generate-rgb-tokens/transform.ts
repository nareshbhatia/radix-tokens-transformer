import type { DesignTokenGroup, DesignTokensFile } from './types';

// Helper function to check if a value is a DesignToken
function isDesignToken(value: object): boolean {
  return '$type' in value && '$value' in value;
}

// Function to transform a color group
function transformColorGroup(group: DesignTokenGroup, groupName: string) {
  const result: DesignTokenGroup = {};

  for (const [key, value] of Object.entries(group)) {
    if (isDesignToken(value)) {
      // Don't transform alpha and contrast tokens
      if (!/^a(?:1[0-2]|[1-9])$/.test(key) && key !== 'contrast') {
        // Create rgb version of the token
        result[`${key}-rgb`] = {
          $type: 'color',
          /*
           * Alias it to the main token:
           * 1. For shallow groups, format as {Color.key}, e.g. {Color.white}
           * 2. For deeper groups, format as {Color.groupName.key}, e.g. {Color.Accent.1}
           */
          $value:
            groupName === 'Color'
              ? `{Color.${key}}`
              : `{Color.${groupName}.${key}}`,
        };
      }
    } else {
      result[key] = transformColorGroup(value as DesignTokenGroup, key);
    }
  }

  return result;
}

// Function to transform a token file
export function transformDesignTokenFile(
  inputFile: DesignTokensFile,
): DesignTokensFile {
  const result: DesignTokensFile = {};

  // Iterate through each group in the input file
  for (const [groupName, group] of Object.entries(inputFile)) {
    if (groupName === 'Color') {
      result[groupName] = transformColorGroup(group, groupName);
    }
  }

  return result;
}
