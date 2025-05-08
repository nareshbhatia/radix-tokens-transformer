import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import { promisify } from 'util';

const execAsync = promisify(exec);

// Define the mapping of source files to destination paths
const fileMappings = [
  {
    source: 'tokens-figma/color-mode.dark.tokens.json',
    destination: 'tokens-w3c/color-mode/color-mode.dark.tokens.json',
  },
  {
    source: 'tokens-figma/color-mode.light.tokens.json',
    destination: 'tokens-w3c/color-mode/color-mode.light.tokens.json',
  },
  {
    source: 'tokens-figma/primitives.corporate.tokens.json',
    destination: 'tokens-w3c/primitives/primitives.corporate.tokens.json',
  },
  {
    source: 'tokens-figma/primitives.twilight.tokens.json',
    destination: 'tokens-w3c/primitives/primitives.twilight.tokens.json',
  },
  {
    source: 'tokens-figma/primitives.velvet.tokens.json',
    destination: 'tokens-w3c/primitives/primitives.velvet.tokens.json',
  },
  {
    source: 'tokens-figma/semantic-colors.tokens.json',
    destination: 'tokens-w3c/semantic/semantic-colors.tokens.json',
  },
  {
    source: 'tokens-figma/semantic-tokens.tokens.json',
    destination: 'tokens-w3c/semantic/semantic-tokens.tokens.json',
  },
  {
    source: 'tokens-figma/theme.corporate.tokens.json',
    destination: 'tokens-w3c/theme/theme.corporate.tokens.json',
  },
  {
    source: 'tokens-figma/theme.twilight.tokens.json',
    destination: 'tokens-w3c/theme/theme.twilight.tokens.json',
  },
  {
    source: 'tokens-figma/theme.velvet.tokens.json',
    destination: 'tokens-w3c/theme/theme.velvet.tokens.json',
  },
];

// Process all files
async function transformFigmaTokensToW3C() {
  for (const mapping of fileMappings) {
    try {
      // Ensure destination directory exists
      const destDir = path.dirname(mapping.destination);
      if (!fs.existsSync(destDir)) {
        fs.mkdirSync(destDir, { recursive: true });
      }

      // Run the node command
      const command = `npx figvar-to-w3c ${mapping.source} ${mapping.destination} ./codegen/transform-figma-tokens-to-w3c/rules.json`;
      const { stderr } = await execAsync(command);

      if (stderr) {
        console.error(`Error processing ${mapping.source}:`, stderr);
      } else {
        console.log(`Processed ${mapping.source} -> ${mapping.destination}`);
      }
    } catch (error) {
      console.error(`Error processing ${mapping.source}:`, error);
    }
  }
}

// Run the script
transformFigmaTokensToW3C().catch(console.error);
