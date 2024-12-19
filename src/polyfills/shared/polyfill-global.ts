/**
 * Adds polyfills to the global scope when not natively available.
 *
 * Takes a list of names, if any of the names is present in the global scope,
 * none of the polyfills will be applied, otherwise the implementation will be
 * generated using the provided function, and assigned to the appropriate names
 * in the global scope.
 *
 * @example
 *   registerPolyfills("atob")(() => {
 *     const impl = function atob() {
 *       const decodedData = GLib.base64_decode(data);
 *       return new TextDecoder().decode(decodedData);
 *     };
 *
 *     return {
 *       atob: impl,
 *     };
 *   });
 */
export const registerPolyfills = <Names extends string>(
  ...reserveNames: Names[]
) => {
  let isAnyDefined = false;
  for (const name of reserveNames) {
    if (name in globalThis) {
      console.warn(
        `Polyfill Error: ${name} is already defined in the global scope.`,
      );
      isAnyDefined = true;
    }
  }

  if (isAnyDefined) {
    return (getImplementation: () => Record<Names, any>) => {};
  }

  return (getImplementation: () => Record<Names, any>) => {
    const implementations = getImplementation();

    for (const name of reserveNames) {
      Object.defineProperty(globalThis, name, {
        value: implementations[name],
        enumerable: false,
      });
    }
  };
};

registerPolyfills.fromModule = (
  module: Record<string, any>,
) => {
  const entries = Object.entries(module);
  const names = entries.map(([name]) => name);
  registerPolyfills(...names)(() => {
    return module;
  });
};
