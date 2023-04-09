interface TrackedFunction<A extends any[], R> {
  (...args: A): R;
  calls: Array<{ args: A; result?: R; error?: any }>;
  clear(): void;
}

export const createFunction = <A extends any[], R>(
  fn: (...args: A) => R
): TrackedFunction<A, R> => {
  const calls: TrackedFunction<A, R>["calls"] = [];

  function trackedFn(...args: A) {
    try {
      const result = fn(...args);
      calls.push({ args, result });
      return result;
    } catch (error) {
      calls.push({ args, error });
      throw error;
    }
  }

  trackedFn.calls = calls;
  trackedFn.clear = () => {
    calls.splice(0, calls.length);
  };

  return trackedFn as any;
};
