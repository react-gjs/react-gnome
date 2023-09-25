// src/polyfills/shared/polyfill-global.ts
var registerPolyfills = (...reserveNames) => {
  let isAnyDefined = false;
  for (const name of reserveNames) {
    if (name in globalThis) {
      console.warn(
        `Polyfill Error: ${name} is already defined in the global scope.`
      );
      isAnyDefined = true;
    }
  }
  if (isAnyDefined) {
    return (getImplementation) => {
    };
  }
  return (getImplementation) => {
    const implementations = getImplementation();
    for (const name of reserveNames) {
      Object.defineProperty(globalThis, name, {
        value: implementations[name],
        enumerable: false
      });
    }
  };
};
export {
  registerPolyfills
};
