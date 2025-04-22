import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

// Define the mapping of source files to destination paths
const fileMappings = [
  {
    source: 'tokens-from-figma/color-mode.dark.tokens.json',
    destination: 'tokens/color-mode/color-mode.dark.tokens.json'
  },
  {
    source: 'tokens-from-figma/color-mode.light.tokens.json',
    destination: 'tokens/color-mode/color-mode.light.tokens.json'
  },
  {
    source: 'tokens-from-figma/primitives.corporate.tokens.json',
    destination: 'tokens/primitives/primitives.corporate.tokens.json'
  },
  {
    source: 'tokens-from-figma/primitives.twilight.tokens.json',
    destination: 'tokens/primitives/primitives.twilight.tokens.json'
  },
  {
    source: 'tokens-from-figma/primitives.velvet.tokens.json',
    destination: 'tokens/primitives/primitives.velvet.tokens.json'
  },
  {
    source: 'tokens-from-figma/semantic.tokens.json',
    destination: 'tokens/semantic/semantic.tokens.json'
  },
  {
    source: 'tokens-from-figma/theme.corporate.tokens.json',
    destination: 'tokens/theme/theme.corporate.tokens.json'
  },
  {
    source: 'tokens-from-figma/theme.twilight.tokens.json',
    destination: 'tokens/theme/theme.twilight.tokens.json'
  },
  {
    source: 'tokens-from-figma/theme.velvet.tokens.json',
    destination: 'tokens/theme/theme.velvet.tokens.json'
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
      const command = `npx figvar-to-w3c ${mapping.source} ${mapping.destination} ./figvar-to-w3c-rules/rules.json`;
      const { stdout, stderr } = await execAsync(command);
      
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