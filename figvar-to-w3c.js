import fs from 'fs';

/**
 * @typedef {Object} RuleOverride
 * @property {string} tokenName - Name of the specific token to override
 * @property {string} outputUnit - Unit to use for this specific token
 * @property {string} [outputType] - Optional override for the output type
 */

/**
 * @typedef {Object} UnitConversion
 * @property {string} inputUnit - The unit of the input value
 * @property {string} outputUnit - The unit to convert to
 * @property {function} convert - Function to convert from input to output unit
 */

/**
 * @typedef {Object} Rule
 * @property {string} groupName - Name of the token group to transform
 * @property {string} inputType - Input type of tokens in this group
 * @property {string} outputType - Output type for tokens in this group
 * @property {string} inputUnit - Default input unit for tokens in this group
 * @property {string} outputUnit - Default output unit for tokens in this group
 * @property {Array<RuleOverride>} overrides - Array of specific token overrides
 */

// Define unit conversion rules
const unitConversions = {
  'px-to-rem': {
    inputUnit: 'px',
    outputUnit: 'rem',
    convert: (value) => value / 16
  },
  'rem-to-px': {
    inputUnit: 'rem',
    outputUnit: 'px',
    convert: (value) => value * 16
  }
};

/**
 * Gets the appropriate conversion function for the given units
 * @param {string} inputUnit - Input unit
 * @param {string} outputUnit - Output unit
 * @returns {function|null} Conversion function or null if no conversion needed
 */
function getConversionFunction(inputUnit, outputUnit) {
  if (inputUnit === outputUnit) return null;
  
  const conversionKey = `${inputUnit}-to-${outputUnit}`;
  return unitConversions[conversionKey]?.convert || null;
}

/**
 * Transforms tokens according to the provided rules
 * @param {Object} tokens - Input tokens object
 * @param {Array<Rule>} rules - Array of transformation rules
 * @returns {Object} Transformed tokens object
 */
function transformTokens(tokens, rules) {
  const transformedTokens = { ...tokens };

  for (const rule of rules) {
    const group = transformedTokens[rule.groupName];
    if (!group) continue;

    for (const [tokenName, token] of Object.entries(group)) {
      // Find override if it exists
      const override = rule.overrides.find(o => o.tokenName === tokenName);
      const outputUnit = override ? override.outputUnit : rule.outputUnit;
      const outputType = override?.outputType || rule.outputType;
      
      // Skip value conversion if no units specified
      if (!rule.inputUnit && !rule.outputUnit) {
        transformedTokens[rule.groupName][tokenName] = {
          $type: outputType,
          $value: token.$value
        };
        continue;
      }
      
      // Get conversion function if needed
      const convert = getConversionFunction(rule.inputUnit, outputUnit);
      
      // Transform the value if needed
      const value = convert ? convert(token.$value) : token.$value;

      // Transform the token
      transformedTokens[rule.groupName][tokenName] = {
        $type: outputType,
        $value: outputUnit ? `${value}${outputUnit}` : value
      };
    }
  }

  return transformedTokens;
}

export function processTokens(inputPath, outputPath, rules) {
  try {
    // Read input file
    const inputContent = fs.readFileSync(inputPath, 'utf8');
    const tokens = JSON.parse(inputContent);

    // Transform tokens
    const transformedTokens = transformTokens(tokens, rules);

    // Write output file
    fs.writeFileSync(
      outputPath,
      JSON.stringify(transformedTokens, null, 2) + '\n'
    );

    console.log(`Successfully transformed tokens and wrote to ${outputPath}`);
  } catch (error) {
    console.error('Error processing tokens:', error);
    process.exit(1);
  }
}

const DimensionOverrides = [
  { tokenName: '0', outputUnit: 'px', outputType: 'dimension' },
  { tokenName: '1', outputUnit: 'px', outputType: 'dimension' }
]

// Example usage
const rules = [
  {
    groupName: 'Dimension',
    inputType: 'number',
    outputType: 'dimension',
    inputUnit: 'px',
    outputUnit: 'rem',
    overrides: DimensionOverrides
  },
  {
    groupName: 'Font Family',
    inputType: 'string',
    outputType: 'fontFamily',
    overrides: []
  },
  {
    groupName: 'Font Size',
    inputType: 'number',
    outputType: 'dimension',
    inputUnit: 'px',
    outputUnit: 'rem',
    overrides: DimensionOverrides
  },
  {
    groupName: 'Font Weight',
    inputType: 'number',
    outputType: 'fontWeight',
    overrides: []
  },
  {
    groupName: 'Line Height',
    inputType: 'number',
    outputType: 'dimension',
    inputUnit: 'px',
    outputUnit: 'rem',
    overrides: DimensionOverrides
  },
  {
    groupName: 'Radius',
    inputType: 'number',
    outputType: 'dimension',
    inputUnit: 'px',
    outputUnit: 'px',
    overrides: DimensionOverrides
  }
];

// Get input and output paths from command line arguments
const inputPath = process.argv[2];
const outputPath = process.argv[3];

if (!inputPath || !outputPath) {
  console.error('Usage: node figma-to-w3c.js <input-file> <output-file>');
  process.exit(1);
}

processTokens(inputPath, outputPath, rules); 