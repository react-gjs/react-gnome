declare module "gest-globals" {
  export type It = {
    name: string;
    line: number;
    callback: () => any;
  };
  export type TestHook = {
    callback: () => any;
    line: number;
  };
  export type Test = {
    name: string;
    line: number;
    beforeAll: Array<TestHook>;
    beforeEach: Array<TestHook>;
    afterEach: Array<TestHook>;
    afterAll: Array<TestHook>;
    subTests: Test[];
    its: Array<It>;
  };
  export type TestSuite = {};
  export type MatcherResult =
    | {
        failed: false;
      }
    | {
        failed: true;
        reason: string;
      };
  export type Matcher = (
    testedValue: any,
    matcherArgs: any[]
  ) => MatcherResult | Promise<MatcherResult>;
  export const describe: (name: string, fn: () => void) => Test;
  export const it: (name: string, fn: () => any) => void;
  export const beforeAll: (fn: () => void) => void;
  export const afterAll: (fn: () => void) => void;
  export const beforeEach: (fn: () => void) => void;
  export const afterEach: (fn: () => void) => void;
  export type MatcherResultHandlers = {
    sync: (result: MatcherResult, negate?: boolean) => void;
    async: (result: Promise<MatcherResult>, negate?: boolean) => Promise<void>;
  };
  export class ExpectError extends Error {
    private timeoutId;
    constructor(message: string);
    private detectUnhandled;
    handle(): void;
  }
  interface Expect {
    /**
     * Negates the matcher. The test will pass if expectation
     * fails.
     */
    not: Omit<Expect, "not">;
    /**
     * Compares the tested value to the expected value using
     * strict equality.
     */
    toBe(expected: any): void;
    /**
     * Compares the tested value to the expected value using deep
     * equality.
     */
    toEqual(expected: any): void;
    /**
     * Check if the tested value is specifically `null` or
     * `undefined`.
     */
    toBeUndefined(): void;
    /**
     * Check if the tested value is defined. `null` and
     * `undefined` values will fail this expectation.
     */
    toBeDefined(): void;
    /** Check if the tested value is of the specified type. */
    toBeOfType(expected: string): void;
    /**
     * Check if the tested value matches with the specified
     * value, the specified values can be a custom match (for
     * example `match.anything()`).
     *
     * Matching also does not care about additional properties on
     * the tested objects.
     *
     * Matching is deep, so it will work even with nested
     * objects.
     */
    toMatch(expected: any): void;
    /**
     * Check if the tested value is a string that matches the
     * specified regular expression.
     */
    toMatchRegex(expected: RegExp): void;
    /**
     * Check if the tested value is an array that contains the
     * specified values. Each value must be strictly equal to the
     * tested value.
     */
    toContain(...expected: any[]): void;
    /**
     * Check if the tested value is an array that contains the
     * specified values. Each value is deeply compared to the
     * tested value.
     */
    toContainEqual(...expected: any[]): void;
    /**
     * Check if the tested value is an array that contains the
     * specified values. Each value is matched with the tested
     * value.
     */
    toContainMatch(...expected: any[]): void;
    /**
     * Check if the tested value is an array contains the
     * specified values, and only those values. Each value must
     * be strictly equal to the tested value.
     */
    toContainOnly(...expected: any[]): void;
    /**
     * Check if the tested value is an array contains the
     * specified values, and only those values. Each value is
     * deeply compared to the tested value.
     */
    toContainOnlyEqual(...expected: any[]): void;
    /**
     * Check if the tested value is an array contains the
     * specified values, and only those values. Each value is
     * matched with the tested value.
     */
    toContainOnlyMatch(...expected: any[]): void;
    /**
     * Check if the tested value is a function that throws when
     * called.
     *
     * By default test will pass if the function throws anything,
     * if a parameter is specified, the test will pass only if
     * the thrown value is strictly equal to the specified
     * value.
     *
     * If the tested fuinction is async, this matcher will return
     * a promise that should be awaited.
     */
    toThrow(thorwn?: any): void | Promise<void>;
    /**
     * Check if the tested value is a promise that rejects with
     * the specified value.
     *
     * If no value is specified, the test will pass if the
     * promise rejects to any value, otherwise the test will pass
     * only if the rejected value is strictly equal to the
     * specified value.
     *
     * This matcher should always be awaited.
     */
    toReject(expected: Promise<any>): Promise<void>;
  }
  export const expect: (value: any) => Expect;
  export const defineMatcher: (matcherName: string, matcher: Matcher) => void;
  abstract class CustomMatch {
    check(value: any): boolean;
  }
  export const match: {
    /** Matches any non-nullish value. */
    anything(): CustomMatch;
    /** Matches any value of the specified type. */
    type(expectedType: string): CustomMatch;
    /**
     * Matches any value that's an instance of the specified
     * class.
     */
    instanceOf(expectedClass: any): CustomMatch;
    /** Matches any string that contains the specified substring. */
    stringContaining(expected: string): CustomMatch;
    /**
     * Matches any string that matches specified regular
     * expression.
     */
    stringMatchingRegex(expected: RegExp): CustomMatch;
    /**
     * Matches any value that is strictly equal to the specified
     * value. (equivalent to `toBe()`)
     */
    exactly(expected: any): CustomMatch;
    /**
     * Matches any value that is equal to the specified value,
     * using deep comparison. (equivalent to `toEqual()`)
     */
    equal(expected: any): CustomMatch;
  };
}
