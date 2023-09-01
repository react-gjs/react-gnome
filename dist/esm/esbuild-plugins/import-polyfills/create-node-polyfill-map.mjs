// src/esbuild-plugins/import-polyfills/create-node-polyfill-map.ts
import path from "path";
var createNodePolyfillMap = (polyfills) => {
  return {
    addResolvers(program, build) {
      for (const pollyfill of polyfills) {
        if (pollyfill.configFlag(program.config)) {
          build.onResolve({ filter: pollyfill.matcher }, (args) => {
            return build.resolve(
              "react-gnome/" + path.join("polyfills/esm", pollyfill.filename),
              {
                importer: args.importer,
                namespace: args.namespace,
                kind: args.kind,
                pluginData: args.pluginData,
                resolveDir: args.resolveDir
              }
            );
          });
        }
      }
    }
  };
};
export {
  createNodePolyfillMap
};
