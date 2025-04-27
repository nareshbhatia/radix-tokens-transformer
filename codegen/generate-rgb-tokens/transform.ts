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
      result[`${key}-rgb`] = {
        $type: 'color',
        $value: `{Color.${groupName}.${key}}`,
      };
    } else {
      result[key] = transformColorGroup(
        value as DesignTokenGroup,
        `${groupName}.${key}`,
      );
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
