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
export declare const registerPolyfills: <Names extends string>(...reserveNames: Names[]) => (getImplementation: () => Record<Names, any>) => void;
