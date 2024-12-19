export function registerGlobal<T>(
  key: string,
  getImplementation: (prevImpl: T | undefined) => T,
) {
  // @ts-expect-error
  const prevImpl = key in globalThis ? globalThis[key] as T : undefined;
  Object.defineProperty(globalThis, key, {
    value: getImplementation(prevImpl),
    writable: false,
    configurable: false,
  });
}
