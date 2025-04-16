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
 * @returns {boolean} True if the pattern is a range pattern, false otherwise
 * @private
 */
function isRangePattern(pattern, separator = ",") {
  // First, remove all whitespace for checking
  const noWhitespace = pattern.replace(/\s+/g, "");

  // Remove trailing commas if present
  // const separatorPattern = /,+$/
  const separatorPattern = new RegExp(`\\${separator}+$`);
  const trimmedPattern = noWhitespace.replace(separatorPattern, "");

  // Must have at least one comma to be a range
  if (!trimmedPattern.includes(",")) {
    return false;
  }

  // Split by commas and check each part is a valid number
  const parts = trimmedPattern.split(",");

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
 * @returns {string[]} Array of choice options
 * @private
 */
function parseChoicesPattern(pattern, separator = "|") {
  // Split by the pipe character, preserving whitespace
  return pattern.split(separator);
}

/**
 * Shared helper for parse and count functions
 *
 *
 *
 **/

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
 *
 * @param {string} template - Template string with {...} patterns
 * @returns {IterableIterator<string>} Iterator of all pattern combinations
 * @example
 * parse('Count: {1,5}') // Equivalent to compile`Count: ${range(1, 5)}`
 * parse('Color: {red|green|blue}') // Equivalent to compile`Color: ${['red', 'green', 'blue']}`
 */
function parse(
  template,
  {
    patternStart = "{",
    patternEnd = "}",
    separatorRange = ",",
    separatorChoices = "|",
  } = {}
) {
  const { patterns, stringParts } = subHelper(template, {
    patternStart,
    patternEnd,
    separatorRange,
    separatorChoices,
  });

  // Convert patterns to generators
  const generators = patterns.map((pattern) => {
    if (isRangePattern(pattern, separatorRange)) {
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

  // Use compile with the parsed parts
  return compile(templateStrings, ...generators);
}

/**
 * Counts the number of combinations for a given string template
 *
 * Pattern formats:
 * - see "parse" function above
 * @param {string} template - Template string with {...} patterns
 * @returns {number} Total number of combinations
 * @example
 * parse('Count: {1,5}') // 5
 * parse('Color: {red|green|blue}') // 3
 */
function count(
  template,
  {
    patternStart = "{",
    patternEnd = "}",
    separatorRange = ",",
    separatorChoices = "|",
  } = {}
) {
  let count = 1;
  const { patterns } = subHelper(template, {
    patternStart,
    patternEnd,
  });

  patterns.forEach((pattern) => {
    if (isRangePattern(pattern, separatorRange)) {
      // It's a range pattern, parse ignoring whitespace
      const [start, end, step] = parseRangePattern(pattern, separatorRange);
      // Calculate the number of values in the range
      // const rangeCount = Math.floor((end - start) / step) + 1; // TODO : not sure if this is right? Does this account for end properly?
      const rangeCount = [...range(start, end, step)].length;
      count *= rangeCount;
    } else {
      count *= pattern.split(separatorChoices).length;
    }
  });
  return count;
}
const choose = (
  template,
  {
    patternStart = "{",
    patternEnd = "}",
    separatorRange = ",",
    separatorChoices = "|",
  } = {}
) => {
  const { patterns, stringParts } = subHelper(template, {
    patternStart,
    patternEnd,
    separatorRange,
    separatorChoices,
  });

  // Convert patterns to generators
  const generators = patterns.map((pattern) => {
    if (isRangePattern(pattern, separatorRange)) {
      // It's a range pattern, parse ignoring whitespace
      const [start, end, step] = parseRangePattern(pattern, separatorRange);
      return [...range(start, end, step)];
    } else {
      // It's a choices pattern, preserve whitespace
      return pattern.split(separatorChoices);
    }
  });

  // Create template strings array (needs to have a raw property)
  const templateStrings = Object.assign([...stringParts], {
    raw: [...stringParts],
  });

  return (...choices) => {
    const picks = generators.map((generator, index) => {
      // Choose a random value from the generator
      const values = [...generator];
      const randomIndex =
        choices[index] ?? Math.floor(Math.random() * values.length);
      return [values[randomIndex]];
    });
    // Use compile with the parsed parts
    return [...compile(templateStrings, ...picks)][0];
  };
};

export { range, compile, parse, count, choose };
export default parse;
