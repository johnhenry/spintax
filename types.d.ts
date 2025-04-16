/**
 * Type definitions for spintax
 * Combinatorial String Generator
 */

export type ChoiceValue = string | number;

/**
 * Generator function interface for all combinatorial elements
 */
export interface CartesianGenerator<T = any> {
  /**
   * Returns all possible values for this generator
   */
  values(): Iterable<T>;
}

/**
 * Creates a generator that yields numbers within a specified range
 * @example
 * range(1, 5, 1) // yields 1, 2, 3, 4, 5
 * range(0, 10, 3, true) // yields 0, 3, 6, 9, 10 (note 10 is included)
 */
export function range(
  start: number,
  end: number,
  step?: number,
  includeEnd?: boolean
): CartesianGenerator<number>;

/**
 * Tagged template function that processes template strings with embedded generators
 * @example
 * compile`Hello ${['world', 'universe']}!`
 */
export function compile(
  strings: TemplateStringsArray,
  ...expressions: (CartesianGenerator<number | string> | string[] | number[])[]
): IterableIterator<string>;

/**
 * Parses a template string with special patterns and returns a generator
 *
 * Pattern formats:
 * - {1,10} - Range from 1 to 10
 * - {1,10,2} - Range from 1 to 10 with step 2
 * - {option1|option2|option3} - Choices between options
 * - {singleOption} - Single choice
 * - {$n} - Back reference to the nth choice (0-based index)
 *
 * @example
 * parse('Count: {1,5}') // Equivalent to compile`Count: ${range(1, 5)}`
 * parse('Color: {red|green|blue}') // Equivalent to compile`Color: ${['red', 'green', 'blue']}`
 * parse('You {see|hear|feel} the work. Once you {$0}.') // Back references previous choice
 */
export function parse(template: string, options?: {
  patternStart?: string;
  patternEnd?: string;
  separatorRange?: string;
  separatorChoices?: string;
  backReferenceMarker?: string;
}): IterableIterator<string>;
