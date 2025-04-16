/**
 * Cartesian Template - Combinatorial String Generator
 *
 * A library for generating all possible combinations of template strings
 * with variable elements.
 */

/**
 * Base class for all generators
 * @typedef {import('../types').CartesianGenerator} CartesianGenerator
 */
class Generator {
  /**
   * Returns an iterable of all possible values
   * @returns {Iterable<any>}
   */
  values() {
    throw new Error("Method not implemented");
  }
  [Symbol.iterator]() {
    return this.values();
  }
}

/**
 * Generator for choices between multiple string or number options
 * @implements {CartesianGenerator<string|number>}
 */
class ChoicesGenerator extends Generator {
  /**
   * @param {Array<string|number>} options - The choices to select from
   * @example
   * new ChoicesGenerator(['red', 'green', 'blue'])
   */
  constructor(options) {
    super();
    this.options = options;
  }

  /**
   * Returns all possible values for this choice
   * @returns {Iterable<string|number>}
   */
  *values() {
    for (const option of this.options) {
      yield option;
    }
  }
}

/**
 * Generator for numerical ranges
 * @implements {CartesianGenerator<number>}
 */
class RangeGenerator extends Generator {
  /**
   * @param {number} start - Starting value (inclusive)
   * @param {number} end - Ending value (inclusive)
   * @param {number} step - Increment between values
   * @param {boolean} [includeEnd=true] - Always include the end value even if not divisible by step
   * @example
   * new RangeGenerator(1, 10, 2) // 1, 3, 5, 7, 9
   * new RangeGenerator(1, 10, 3, true) // 1, 4, 7, 10
   */
  constructor(start, end, step = 1, includeEnd = true) {
    super();
    this.start = start;
    this.end = end;
    this.step = step;
    this.includeEnd = includeEnd;
  }

  /**
   * Returns all values in this range
   * @returns {Iterable<number>}
   */
  *values() {
    for (let i = this.start; i <= this.end; i += this.step) {
      yield i;
    }

    // If includeEnd is true and the last value wasn't included due to step,
    // include the end value explicitly
    if (
      this.includeEnd &&
      (this.end - this.start) % this.step !== 0 &&
      this.end >
        this.start + Math.floor((this.end - this.start) / this.step) * this.step
    ) {
      yield this.end;
    }
  }
}

/**
 * Represents a non-generator placeholder for static values
 * @private
 */
class StaticGenerator {
  /**
   * @param {any} value - The static value
   */
  constructor(value) {
    this.value = value;
  }

  /**
   * @returns {Iterable<any>}
   */
  *values() {
    yield this.value;
  }
}

/**
 * Helper function to collect all values from a generator
 * @param {Iterable<any>} iterable - The iterable to collect values from
 * @returns {Array<any>} Array of all values
 * @private
 */
const collectValues = (iterable) => [...iterable];

/**
 * Creates a cartesian product of all provided generators
 * @param {Array<CartesianGenerator>} generators - List of generators to combine
 * @returns {Generator<Array<any>>} Generator of all combinations
 * @private
 */
function* cartesianProduct(generators) {
  // For zero generators, yield an empty combination
  if (generators.length === 0) {
    yield [];
    return;
  }

  // For one generator, yield each value as a single-element array
  if (generators.length === 1) {
    for (const value of generators[0].values()) {
      yield [value];
    }
    return;
  }

  // For multiple generators, compute the cartesian product
  // First, collect all values from each generator
  const allValues = generators.map((gen) => collectValues(gen.values()));

  // Generate all combinations using nested loops
  function* generateCombinations(index, current) {
    if (index === allValues.length) {
      yield [...current];
      return;
    }

    for (const value of allValues[index]) {
      current[index] = value;
      yield* generateCombinations(index + 1, current);
    }
  }

  yield* generateCombinations(0, new Array(allValues.length));
}

/**
 * Creates a generator that yields numbers within a specified range
 * @param {number} start - Starting value (inclusive)
 * @param {number} end - Ending value (inclusive)
 * @param {number} [step=1] - Increment between values
 * @param {boolean} [includeEnd=true] - Always include the end value even if not divisible by step
 * @returns {CartesianGenerator<number>}
 * @example
 * range(1, 5, 1) // yields 1, 2, 3, 4, 5
 * range(0, 10, 3, true) // yields 0, 3, 6, 9, 10 (note 10 is included)
 */
const range = (start, end, step = 1, includeEnd = true) =>
  new RangeGenerator(start, end, step, includeEnd);

/**
 * Tagged template function that processes template strings with embedded generators
 * @param {TemplateStringsArray} strings - String parts
 * @param {...any} expressions - Expressions that may contain generators
 * @returns {IterableIterator<string>}
 * @example
 * compile`Hello ${['world', 'universe']}!`
 */
function compile(strings, ...expressions) {
  const generators = expressions.map((expr) =>
    expr instanceof Generator
      ? expr
      : Array.isArray(expr)
      ? expr
      : new StaticGenerator(expr)
  );

  return {
    /**
     * Iterator implementation
     */
    [Symbol.iterator]: function* () {
      for (const combination of cartesianProduct(generators)) {
        let result = strings[0];
        for (let i = 0; i < combination.length; i++) {
          result += combination[i] + strings[i + 1];
        }
        yield result;
      }
    },
  };
}

/**
 * Determines if a pattern contains only numeric values and commas (a range pattern)
 * @param {string} pattern - The pattern to check
 * @param {string} separator - The separator character
 * @returns {boolean} True if the pattern is a range pattern, false otherwise
 * @private
 */
function isRangePattern(pattern, separator = ",") {
  // First, remove all whitespace for checking
  const noWhitespace = pattern.replace(/\s+/g, "");

  // Remove trailing commas if present
  const separatorPattern = new RegExp(`\\${separator}+$`);
  const trimmedPattern = noWhitespace.replace(separatorPattern, "");

  // Must have at least one comma to be a range
  if (!trimmedPattern.includes(separator)) {
    return false;
  }

  // Split by commas and check each part is a valid number
  const parts = trimmedPattern.split(separator);

  // Range patterns must have 2 or 3 parts
  if (parts.length < 2 || parts.length > 3) {
    return false;
  }

  // Each part must be a valid number
  return parts.every((part) => {
    // Empty parts (from multiple commas) are not valid
    if (part === "") return false;
    // Check if it's a valid number
    return !isNaN(parseFloat(part)) && isFinite(Number(part));
  });
}

/**
 * Parses a range pattern into start, end, and optional step values
 * @param {string} pattern - The range pattern to parse
 * @param {string} separator - The separator character
 * @returns {[number, number, number]} Array with [start, end, step]
 * @private
 */
function parseRangePattern(pattern, separator = ",") {
  // Remove all whitespace
  const noWhitespace = pattern.replace(/\s+/g, "");

  // Remove trailing commas
  const separatorPattern = new RegExp(`\\${separator}+$`);
  const trimmedPattern = noWhitespace.replace(separatorPattern, "");

  // Split by comma and convert to numbers
  const parts = trimmedPattern.split(separator).map((part) => parseFloat(part));

  const start = parts[0];
  const end = parts[1];
  const step = parts.length > 2 ? parts[2] : 1;

  return [start, end, step];
}

/**
 * Parses a choices pattern, preserving whitespace in the options
 * @param {string} pattern - The choices pattern to parse
 * @param {string} separator - The separator character
 * @returns {string[]} Array of choice options
 * @private
 */
function parseChoicesPattern(pattern, separator = "|") {
  // Split by the pipe character, preserving whitespace
  return pattern.split(separator);
}

/**
 * Shared helper for parse and count functions
 * Extracts patterns from the template string
 * @param {string} template - The template string
 * @param {Object} options - Options for pattern extraction
 * @param {string} options.patternStart - Pattern start delimiter
 * @param {string} options.patternEnd - Pattern end delimiter
 * @returns {Object} Object containing patterns and string parts
 * @private
 */
function subHelper(template, { patternStart, patternEnd } = {}) {
  // Find all {...} patterns
  const patterns = [];
  const patternRegex = new RegExp(
    `${patternStart}([^${patternEnd}]+)${patternEnd}`,
    "g"
  );
  const stringParts = [];
  let lastIndex = 0;
  let match;

  while ((match = patternRegex.exec(template)) !== null) {
    // Add the text before the pattern
    stringParts.push(template.substring(lastIndex, match.index));

    // Add the pattern itself
    patterns.push(match[1]);

    // Update the last index
    lastIndex = match.index + match[0].length;
  }

  // Add the remaining text after the last pattern
  stringParts.push(template.substring(lastIndex));

  return { patterns, stringParts };
}

/**
 * Parses a template string with special patterns and returns a generator
 *
 * Pattern formats:
 * - {1,10} - Range from 1 to 10 (whitespace ignored)
 * - {1,10,2} - Range from 1 to 10 with step 2 (whitespace ignored)
 * - {option1|option2|option3} - Choices between options (whitespace preserved)
 * - {singleOption} - Single choice (whitespace preserved)
 * - {$n} - Back reference to the nth choice (0-based index)
 *
 * @param {string} template - Template string with {...} patterns
 * @param {Object} options - Options for pattern parsing
 * @param {string} options.patternStart - Pattern start delimiter (default: '{')
 * @param {string} options.patternEnd - Pattern end delimiter (default: '}')
 * @param {string} options.separatorRange - Separator for range patterns (default: ',')
 * @param {string} options.separatorChoices - Separator for choices patterns (default: '|')
 * @param {string} options.backReferenceMarker - Marker for back references (default: '$')
 * @returns {IterableIterator<string>} Iterator of all pattern combinations
 * @example
 * parse('Count: {1,5}') // Equivalent to compile`Count: ${range(1, 5)}`
 * parse('Color: {red|green|blue}') // Equivalent to compile`Color: ${['red', 'green', 'blue']}`
 * parse('You {see|hear} that. Once you {$0}.') // Back references previous choice
 */
function parse(
  template,
  {
    patternStart = "{",
    patternEnd = "}",
    separatorRange = ",",
    separatorChoices = "|",
    backReferenceMarker = "$"
  } = {}
) {
  const { patterns, stringParts } = subHelper(template, {
    patternStart,
    patternEnd
  });

  // First pass: identify back references
  const backReferenceRegex = new RegExp(`\\${backReferenceMarker}(\\d+)`);
  const backReferences = [];
  const generatorPatterns = [];
  
  // Separate back references from regular patterns
  for (const pattern of patterns) {
    const backRefMatch = pattern.match(backReferenceRegex);
    
    if (backRefMatch && backRefMatch[0] === pattern && pattern.trim() === backRefMatch[0]) {
      // This is a back reference pattern
      const refIndex = parseInt(backRefMatch[1], 10);
      backReferences.push(refIndex);
      generatorPatterns.push(null); // Placeholder
    } else {
      // Regular pattern
      backReferences.push(null);
      generatorPatterns.push(pattern);
    }
  }
  
  // Convert patterns to generators
  const generators = generatorPatterns.map((pattern) => {
    if (!pattern) {
      // Back reference placeholder - use a dummy generator with a single value
      // It will be replaced during iteration with actual referenced value
      return new StaticGenerator(""); // Just a placeholder
    } else if (isRangePattern(pattern, separatorRange)) {
      // It's a range pattern, parse ignoring whitespace
      const [start, end, step] = parseRangePattern(pattern, separatorRange);
      return range(start, end, step);
    } else {
      // It's a choices pattern, preserve whitespace
      return pattern.split(separatorChoices);
    }
  });

  // Create template strings array (needs to have a raw property)
  const templateStrings = Object.assign([...stringParts], {
    raw: [...stringParts],
  });
  
  // Custom generator to handle back references
  return {
    [Symbol.iterator]: function* () {
      // First, identify the actual choice patterns (non-back references)
      const actualChoicePatterns = [];
      const actualChoiceIndices = [];
      
      for (let i = 0; i < generatorPatterns.length; i++) {
        if (backReferences[i] === null) {
          // This is a regular pattern (not a back reference)
          actualChoicePatterns.push(generators[i]); // Keep the generator
          actualChoiceIndices.push(i); // Remember its original position
        }
      }
      
      // Generate all combinations of actual choices
      for (const actualCombination of cartesianProduct(actualChoicePatterns)) {
        // Create a combination with back references resolved
        const resolvedCombination = new Array(patterns.length);
        
        // First, place the actual choices in their original positions
        for (let i = 0; i < actualCombination.length; i++) {
          const originalIndex = actualChoiceIndices[i];
          resolvedCombination[originalIndex] = actualCombination[i];
        }
        
        // Then, resolve the back references
        for (let i = 0; i < patterns.length; i++) {
          if (backReferences[i] !== null) {
            // This is a back reference
            const refIndex = backReferences[i];
            
            // Find the actual value it refers to by finding the refIndex-th actual choice
            let actualChoicesSeen = 0;
            let refValue = null;
            
            for (let j = 0; j < i; j++) {
              if (backReferences[j] === null) {
                // This is an actual choice
                if (actualChoicesSeen === refIndex) {
                  // This is the one we want
                  refValue = resolvedCombination[j];
                  break;
                }
                actualChoicesSeen++;
              }
            }
            
            if (refValue !== null) {
              // Valid back reference
              resolvedCombination[i] = refValue;
            } else {
              // Invalid back reference
              resolvedCombination[i] = `{${backReferenceMarker}${refIndex}}`;
            }
          }
        }
        
        // Build the result string
        let result = stringParts[0];
        for (let i = 0; i < resolvedCombination.length; i++) {
          result += resolvedCombination[i] + stringParts[i + 1];
        }
        
        yield result;
      }
    }
  };
}

/**
 * Counts the number of combinations for a given string template
 *
 * Pattern formats:
 * - see "parse" function above
 * @param {string} template - Template string with {...} patterns
 * @param {Object} options - Options for counting
 * @param {string} options.patternStart - Pattern start delimiter (default: '{')
 * @param {string} options.patternEnd - Pattern end delimiter (default: '}')
 * @param {string} options.separatorRange - Separator for range patterns (default: ',')
 * @param {string} options.separatorChoices - Separator for choices patterns (default: '|')
 * @param {string} options.backReferenceMarker - Marker for back references (default: '$')
 * @returns {number} Total number of combinations
 * @example
 * count('Count: {1,5}') // 5
 * count('Color: {red|green|blue}') // 3
 */
function count(
  template,
  {
    patternStart = "{",
    patternEnd = "}",
    separatorRange = ",",
    separatorChoices = "|",
    backReferenceMarker = "$"
  } = {}
) {
  // Use the same pattern extraction as parse
  const { patterns, stringParts } = subHelper(template, {
    patternStart,
    patternEnd,
  });

  // First pass: identify back references
  const backReferenceRegex = new RegExp(`\\${backReferenceMarker}(\\d+)`);
  const actualChoicePatterns = [];
  
  // Separate back references from regular patterns
  for (const pattern of patterns) {
    const backRefMatch = pattern.match(backReferenceRegex);
    
    if (!(backRefMatch && backRefMatch[0] === pattern && pattern.trim() === backRefMatch[0])) {
      // This is a regular pattern (not a back reference)
      actualChoicePatterns.push(pattern);
    }
  }
  
  // Count is the product of the number of choices for each actual pattern
  let totalCount = 1;
  
  actualChoicePatterns.forEach((pattern) => {
    if (isRangePattern(pattern, separatorRange)) {
      // It's a range pattern, parse ignoring whitespace
      const [start, end, step] = parseRangePattern(pattern, separatorRange);
      // Calculate the number of values in the range
      const rangeCount = [...range(start, end, step)].length;
      totalCount *= rangeCount;
    } else {
      // It's a choices pattern
      totalCount *= pattern.split(separatorChoices).length;
    }
  });
  
  return totalCount;
}

/**
 * Chooses one random or specified combination from the template
 * 
 * @param {string} template - Template string with {...} patterns
 * @param {Object} options - Options for choosing
 * @param {string} options.patternStart - Pattern start delimiter (default: '{')
 * @param {string} options.patternEnd - Pattern end delimiter (default: '}')
 * @param {string} options.separatorRange - Separator for range patterns (default: ',')
 * @param {string} options.separatorChoices - Separator for choices patterns (default: '|')
 * @param {string} options.backReferenceMarker - Marker for back references (default: '$')
 * @returns {Function} Function that returns a single combination
 * @example
 * const picker = choose("The {red|blue|green} {box|circle}");
 * picker() // Random combination like "The red box"
 * picker(0, 1) // Specific combination "The red circle"
 */
const choose = (
  template,
  {
    patternStart = "{",
    patternEnd = "}",
    separatorRange = ",",
    separatorChoices = "|",
    backReferenceMarker = "$"
  } = {}
) => {
  const { patterns, stringParts } = subHelper(template, {
    patternStart,
    patternEnd
  });

  // First pass: identify back references
  const backReferenceRegex = new RegExp(`\\${backReferenceMarker}(\\d+)`);
  const backReferences = [];
  const generatorPatterns = [];
  
  // Separate back references from regular patterns
  for (const pattern of patterns) {
    const backRefMatch = pattern.match(backReferenceRegex);
    
    if (backRefMatch && backRefMatch[0] === pattern && pattern.trim() === backRefMatch[0]) {
      // This is a back reference pattern
      const refIndex = parseInt(backRefMatch[1], 10);
      backReferences.push(refIndex);
      generatorPatterns.push(null); // Placeholder
    } else {
      // Regular pattern
      backReferences.push(null);
      generatorPatterns.push(pattern);
    }
  }
  
  // Convert patterns to arrays of values
  const generators = generatorPatterns.map((pattern) => {
    if (!pattern) {
      // Back reference placeholder (will be replaced during resolution)
      return [""]; // Dummy placeholder
    } else if (isRangePattern(pattern, separatorRange)) {
      // It's a range pattern, parse ignoring whitespace
      const [start, end, step] = parseRangePattern(pattern, separatorRange);
      return [...range(start, end, step)];
    } else {
      // It's a choices pattern, preserve whitespace
      return pattern.split(separatorChoices);
    }
  });

  // Create the picker function
  return (...inputChoices) => {
    // Create an array for all resolved values
    const resolvedValues = new Array(patterns.length);
    let inputChoiceIndex = 0; // Track position in inputChoices
    
    // First, resolve actual pattern choices
    for (let i = 0; i < patterns.length; i++) {
      if (backReferences[i] === null) {
        // This is a regular pattern (not a back reference)
        const values = generators[i];
        
        // Get the choice index (provided or random)
        const choiceIndex = inputChoices[inputChoiceIndex] !== undefined
          ? inputChoices[inputChoiceIndex]
          : Math.floor(Math.random() * values.length);
        
        // Store the selected value
        resolvedValues[i] = values[choiceIndex];
        inputChoiceIndex++; // Move to next input choice
      }
    }
    
    // Then, resolve all back references
    for (let i = 0; i < patterns.length; i++) {
      if (backReferences[i] !== null) {
        // This is a back reference
        const refIndex = backReferences[i];
        
        // Count up to the nth actual choice
        let actualChoiceCount = 0;
        let refValue = null;
        
        for (let j = 0; j < patterns.length; j++) {
          if (backReferences[j] === null) {
            // This is an actual choice
            if (actualChoiceCount === refIndex) {
              // Found the referenced choice
              refValue = resolvedValues[j];
              break;
            }
            actualChoiceCount++;
          }
        }
        
        if (refValue !== null) {
          // Valid back reference
          resolvedValues[i] = refValue;
        } else {
          // Invalid back reference
          resolvedValues[i] = `{${backReferenceMarker}${refIndex}}`;
        }
      }
    }
    
    // Build the result string
    let result = stringParts[0];
    for (let i = 0; i < resolvedValues.length; i++) {
      result += resolvedValues[i] + stringParts[i + 1];
    }
    
    return result;
  };
};

export { range, compile, parse, count, choose };
export default parse;
