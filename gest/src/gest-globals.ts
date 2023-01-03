export type It = {
  name: string;
  line: number;
  column: number;
  callback: () => any;
};

export type TestHook = {
  callback: () => any;
  line: number;
  column: number;
};

export type Test = {
  name: string;
  line: number;
  column: number;
  beforeAll: Array<TestHook>;
  beforeEach: Array<TestHook>;
  afterEach: Array<TestHook>;
  afterAll: Array<TestHook>;
  subTests: Test[];
  its: Array<It>;
};

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

export type MatcherResultHandlers = {
  sync: (result: MatcherResult, negate?: boolean) => void;
  async: (result: Promise<MatcherResult>, negate?: boolean) => Promise<void>;
};

class TestCollector {
  private static current: Test;

  static addBeforeAll(hook: TestHook) {
    TestCollector.current.beforeAll.push(hook);
  }

  static addBeforeEach(hook: TestHook) {
    TestCollector.current.beforeEach.push(hook);
  }

  static addAfterEach(hook: TestHook) {
    TestCollector.current.afterEach.push(hook);
  }

  static addAfterAll(hook: TestHook) {
    TestCollector.current.afterAll.push(hook);
  }

  static addIt(it: It) {
    TestCollector.current.its.push(it);
  }

  static collectSubTest(
    name: string,
    line: number,
    column: number,
    fn: () => void
  ) {
    const parentTest = TestCollector.current;

    const test = (TestCollector.current = {
      name,
      line,
      column,
      afterAll: [],
      afterEach: [],
      beforeAll: [],
      beforeEach: [],
      its: [],
      subTests: [],
    });

    fn();

    if (parentTest) {
      parentTest.subTests.push(TestCollector.current);
      TestCollector.current = parentTest;
    }

    return test;
  }
}

const _toNumber = (value: string | number | undefined, def: number) => {
  if (value === undefined) {
    return def;
  }

  try {
    const n = Number(value);
    if (isNaN(n)) {
      return def;
    }
    return n;
  } catch (e) {
    return def;
  }
};

const _getLineFromError = (error: Error): [number, number] => {
  const stack = error.stack;
  const secondLine = stack?.split("\n")[1];
  const [line, column] = secondLine?.split(":").splice(-2) ?? [];
  return [_toNumber(line, 0), _toNumber(column, 0)];
};

export const describe = (name: string, fn: () => void): Test => {
  // Get line where this function was called
  const [line, column] = _getLineFromError(new Error());

  return TestCollector.collectSubTest(name, line, column, fn);
};

export const it = (name: string, fn: () => any) => {
  // Get line where this function was called
  const [line, column] = _getLineFromError(new Error());

  TestCollector.addIt({
    name,
    line,
    column,
    callback: fn,
  });
};

export const beforeAll = (fn: () => void) => {
  // Get line where this function was called
  const [line, column] = _getLineFromError(new Error());

  TestCollector.addBeforeAll({
    callback: fn,
    line,
    column,
  });
};

export const afterAll = (fn: () => void) => {
  // Get line where this function was called
  const [line, column] = _getLineFromError(new Error());

  TestCollector.addAfterAll({
    callback: fn,
    line,
    column,
  });
};

export const beforeEach = (fn: () => void) => {
  // Get line where this function was called
  const [line, column] = _getLineFromError(new Error());

  TestCollector.addBeforeEach({
    callback: fn,
    line,
    column,
  });
};

export const afterEach = (fn: () => void) => {
  // Get line where this function was called
  const [line, column] = _getLineFromError(new Error());

  TestCollector.addAfterEach({
    callback: fn,
    line,
    column,
  });
};

class Matchers {
  private static matchers = new Map<string, Matcher>();

  static add(name: string, matcher: Matcher) {
    this.matchers.set(name, matcher);
  }

  static get(name: string): Matcher {
    const m = this.matchers.get(name);

    if (!m) {
      throw new Error(`Invalid matcher: '${name}'`);
    }

    return m;
  }

  static proxy(
    testedValue: any,
    handleMatcherResult: MatcherResultHandlers,
    negate?: boolean
  ): any {
    return new Proxy(
      {},
      {
        get(_, matcherName) {
          if (matcherName === "not") {
            return Matchers.proxy(testedValue, handleMatcherResult, true);
          }

          const matcher = Matchers.get(matcherName as string);

          return (...args: any[]) => {
            const r = matcher(testedValue, args);
            if (r instanceof Promise) {
              return handleMatcherResult.async(r, negate);
            } else {
              return handleMatcherResult.sync(r, negate);
            }
          };
        },
        has(_, p) {
          return Matchers.matchers.has(p as string);
        },
        ownKeys() {
          return [...Matchers.matchers.keys()];
        },
      }
    );
  }
}

export class ExpectError extends Error {
  private timeoutId?: NodeJS.Timeout;
  line: number;
  column: number;

  constructor(message: string, line: number, column: number) {
    super(message);
    this.name = "ExpectError";
    this.line = line;
    this.column = column;
    this.detectUnhandled();
  }

  private detectUnhandled() {
    this.timeoutId = setTimeout(() => {
      console.error(
        `An expect error was not handled. This is most likely due to an async matcher not being awaited.\n\nError: ${this.message}`
      );
    }, 100);
  }

  handle() {
    clearTimeout(this.timeoutId);
  }
}

export const expect = (value: any) => {
  // Get line where this function was called
  const [line, column] = _getLineFromError(new Error());

  const handlers: MatcherResultHandlers = {
    sync(result, negate) {
      if (result.failed && !negate) {
        throw new ExpectError(result.reason, line, column);
      } else if (!result.failed && negate) {
        throw new ExpectError(
          "Matcher was expected to fail, but it passed.",
          line,
          column
        );
      }
    },
    async async(result, negate) {
      const awaitedResult = await result;
      return this.sync(awaitedResult, negate);
    },
  };

  return Matchers.proxy(value, handlers);
};

export const defineMatcher = (matcherName: string, matcher: Matcher) => {
  Matchers.add(matcherName, matcher);
};

// Default matchers

function deepEqual(a: any, b: any): boolean {
  if (a === b) {
    return true;
  }

  if (a instanceof Date && b instanceof Date) {
    return a.getTime() === b.getTime();
  }

  if (!a || !b || (typeof a !== "object" && typeof b !== "object")) {
    return a === b;
  }

  if (a.prototype !== b.prototype) {
    return false;
  }

  const keys = Object.keys(a);
  if (keys.length !== Object.keys(b).length) {
    return false;
  }

  return keys.every((k) => deepEqual(a[k], b[k]));
}

abstract class CustomMatch {
  static isCustomMatch(value: any): value is CustomMatch {
    return (
      typeof value === "object" &&
      value !== null &&
      value instanceof CustomMatch
    );
  }

  abstract check(value: any): boolean;
}

function matchValues(a: any, b: any): boolean {
  if (CustomMatch.isCustomMatch(b)) {
    return b.check(a);
  }

  if (a === b) {
    return true;
  }

  if (a instanceof Date && b instanceof Date) {
    return a.getTime() === b.getTime();
  }

  if (!a || !b || (typeof a !== "object" && typeof b !== "object")) {
    return a === b;
  }

  const keys = Object.keys(b);
  if (keys.length > Object.keys(a).length) {
    return false;
  }

  // @ts-ignore
  return keys.every((k) => deepEqual(a[k], b[k], matchValues));
}

defineMatcher("toBe", (testedValue, [expectedValue]) => {
  if (testedValue !== expectedValue) {
    return {
      failed: true,
      reason: `Equality test has failed.\n\nExpected: ${testedValue}\nReceived: ${expectedValue}`,
    };
  }

  return {
    failed: false,
  };
});

defineMatcher("toEqual", (testedValue, [expectedValue]) => {
  if (!deepEqual(testedValue, expectedValue)) {
    return {
      failed: true,
      reason: `Deep equality test has failed.\n\nExpected: ${testedValue}\nReceived: ${expectedValue}`,
    };
  }

  return {
    failed: false,
  };
});

defineMatcher("toBeUndefined", (testedValue) => {
  if (testedValue != null) {
    return {
      failed: true,
      reason: `Expected value to be undefined, but received ${testedValue}`,
    };
  }

  return {
    failed: false,
  };
});

defineMatcher("toBeDefined", (testedValue) => {
  if (testedValue == null) {
    return {
      failed: true,
      reason: `Expected value to be defined, but received ${testedValue}`,
    };
  }

  return {
    failed: false,
  };
});

defineMatcher("toBeOfType", (testedValue, [expectedType]) => {
  if (typeof testedValue !== expectedType) {
    return {
      failed: true,
      reason: `Expected value to be of type ${expectedType}, but received ${testedValue}`,
    };
  }

  return {
    failed: false,
  };
});

defineMatcher("toMatchRegex", (testedValue, [regex]) => {
  if (typeof testedValue !== "string") {
    return {
      failed: true,
      reason: `Expected value to be a string, but received ${typeof testedValue}`,
    };
  }

  if (!regex.test(testedValue)) {
    return {
      failed: true,
      reason: `Expected value to match regex ${regex}, but received ${testedValue}`,
    };
  }

  return {
    failed: false,
  };
});

defineMatcher("toMatch", (testedValue, [expectedValue]) => {
  if (!matchValues(testedValue, expectedValue)) {
    return {
      failed: true,
      reason: `Expected value to match object ${expectedValue}, but received ${testedValue}`,
    };
  }

  return {
    failed: false,
  };
});

defineMatcher("toContain", (testedValue, values) => {
  if (!Array.isArray(testedValue)) {
    return {
      failed: true,
      reason: `Expected value to be an array, but received ${typeof testedValue}`,
    };
  }

  for (const value of values) {
    if (!testedValue.includes(value)) {
      return {
        failed: true,
        reason: `Expected array to contain value ${value}, but received ${testedValue}`,
      };
    }
  }

  return {
    failed: false,
  };
});

defineMatcher("toContainEqual", (testedValue, values) => {
  if (!Array.isArray(testedValue)) {
    return {
      failed: true,
      reason: `Expected value to be an array, but received ${typeof testedValue}`,
    };
  }

  for (const value of values) {
    if (!testedValue.some((v) => deepEqual(v, value))) {
      return {
        failed: true,
        reason: `Expected array to contain value ${value}, but received ${testedValue}`,
      };
    }
  }

  return {
    failed: false,
  };
});

defineMatcher("toContainMatch", (testedValue, values) => {
  if (!Array.isArray(testedValue)) {
    return {
      failed: true,
      reason: `Expected value to be an array, but received ${typeof testedValue}`,
    };
  }

  for (const value of values) {
    if (!testedValue.some((v) => matchValues(v, value))) {
      return {
        failed: true,
        reason: `Expected array to contain value ${value}, but received ${testedValue}`,
      };
    }
  }

  return {
    failed: false,
  };
});

defineMatcher("toContainOnly", (testedValue, expectedValues) => {
  if (!Array.isArray(testedValue)) {
    return {
      failed: true,
      reason: `Expected value to be an array, but received ${typeof testedValue}`,
    };
  }

  for (const value of expectedValues) {
    if (!testedValue.includes(value)) {
      return {
        failed: true,
        reason: `Expected array to contain value ${value}`,
      };
    }
  }

  for (const value of testedValue) {
    if (!expectedValues.some((v) => value === v)) {
      return {
        failed: true,
        reason: `Expected array to contain matching values but received ${value}`,
      };
    }
  }

  return {
    failed: false,
  };
});

defineMatcher("toContainOnlyEqual", (testedValue, expectedValues) => {
  if (!Array.isArray(testedValue)) {
    return {
      failed: true,
      reason: `Expected value to be an array, but received ${typeof testedValue}`,
    };
  }

  for (const value of expectedValues) {
    if (!testedValue.some((v) => deepEqual(v, value))) {
      return {
        failed: true,
        reason: `Expected array to contain value ${value}`,
      };
    }
  }

  for (const value of testedValue) {
    if (!expectedValues.some((v) => deepEqual(value, v))) {
      return {
        failed: true,
        reason: `Expected array to contain matching values but received ${value}`,
      };
    }
  }

  return {
    failed: false,
  };
});

defineMatcher("toContainOnlyMatch", (testedValue, expectedValues) => {
  if (!Array.isArray(testedValue)) {
    return {
      failed: true,
      reason: `Expected value to be an array, but received ${typeof testedValue}`,
    };
  }

  for (const value of expectedValues) {
    if (!testedValue.some((v) => matchValues(v, value))) {
      return {
        failed: true,
        reason: `Expected array to contain value ${value}`,
      };
    }
  }

  for (const value of testedValue) {
    if (!expectedValues.some((v) => matchValues(value, v))) {
      return {
        failed: true,
        reason: `Expected array to contain matching values but received ${value}`,
      };
    }
  }

  return {
    failed: false,
  };
});

defineMatcher("toThrow", (fn, [toBeThrown]) => {
  if (typeof fn !== "function") {
    return {
      failed: true,
      reason: `Expected value to be a function, but received ${typeof fn}`,
    };
  }

  const onErr = (e: any) => {
    if (toBeThrown === undefined) {
      return {
        failed: true,
        reason: `Expected function to throw ${toBeThrown}, but received ${e}`,
      };
    }
    if (e !== toBeThrown) {
      return {
        failed: true,
        reason: `Expected function to throw ${toBeThrown}, but received ${e}`,
      };
    }
  };

  try {
    const result = fn();
    if (result === "object" && fn === null && fn instanceof Promise) {
      return result.catch(onErr);
    }
  } catch (e) {
    return onErr(e);
  }

  return {
    failed: false,
  };
});

defineMatcher("toReject", async (fn, [toBeThrown]) => {
  if (fn !== "object" || fn === null || !(fn instanceof Promise)) {
    return {
      failed: true,
      reason: `Expected value to be a promise, but received ${typeof fn}`,
    };
  }

  try {
    await fn;
  } catch (e) {
    if (toBeThrown === undefined) {
      return {
        failed: true,
        reason: `Expected promise to reject ${toBeThrown}, but received ${e}`,
      };
    }
    if (e !== toBeThrown) {
      return {
        failed: true,
        reason: `Expected promise to reject ${toBeThrown}, but received ${e}`,
      };
    }
  }

  return {
    failed: false,
  };
});

export const match = {
  anything(): CustomMatch {
    class AnythingMatcher extends CustomMatch {
      check(value: any) {
        return value != null;
      }
    }

    return new AnythingMatcher();
  },
  type(expectedType: string): CustomMatch {
    class TypeMatcher extends CustomMatch {
      check(value: any) {
        return typeof value === expectedType;
      }
    }

    return new TypeMatcher();
  },
  instanceOf(expectedClass: any): CustomMatch {
    class InstanceOfMatcher extends CustomMatch {
      check(value: any) {
        return value instanceof expectedClass;
      }
    }

    return new InstanceOfMatcher();
  },
  stringContaining(expectedString: string): CustomMatch {
    class StringContainingMatcher extends CustomMatch {
      check(value: any) {
        return typeof value === "string" && value.includes(expectedString);
      }
    }

    return new StringContainingMatcher();
  },
  stringMatchingRegex(expectedRegex: RegExp): CustomMatch {
    class StringMatchingRegexMatcher extends CustomMatch {
      check(value: any) {
        return typeof value === "string" && expectedRegex.test(value);
      }
    }

    return new StringMatchingRegexMatcher();
  },
  exactly(expectedValue: any): CustomMatch {
    class ExactlyMatcher extends CustomMatch {
      check(value: any) {
        return value === expectedValue;
      }
    }

    return new ExactlyMatcher();
  },
  equal(expectedValue: any): CustomMatch {
    class EqualToMatcher extends CustomMatch {
      check(value: any) {
        return deepEqual(value, expectedValue);
      }
    }

    return new EqualToMatcher();
  },
};
