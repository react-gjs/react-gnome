// src/esbuild-plugins/import-polyfills/create-node-polyfill-map.ts
import path from "path";
import { getDirPath } from "../../get-dirpath/get-dirpath.mjs";
var createNodePolyfillMap = (polyfills) => {
  const rootPath = getDirPath();
  return {
    addResolvers(program, build) {
      for (const pollyfill of polyfills) {
        if (pollyfill.configFlag(program.config)) {
          build.onResolve({ filter: pollyfill.matcher }, (args) => {
            return build.resolve(
              path.join(rootPath, "polyfills/esm", pollyfill.filename),
              {
                resolveDir: rootPath,
                kind: args.kind,
                importer: args.importer
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
