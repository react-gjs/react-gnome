// src/esbuild-plugins/import-polyfills/import-polyfills.ts
import path from "path";
import { getDirPath } from "../../get-dirpath/get-dirpath.mjs";
var NAMESPACE = "react-gnome-polyfills";
var importPolyfillsPlugin = (program) => {
  const config = program.config;
  return {
    name: "react-gnome-import-polyfills-esbuild-plugin",
    setup(build) {
      const rootPath = getDirPath();
      if (config.polyfills?.node) {
        const nodeFills = config.polyfills.node;
        if (nodeFills.path) {
          build.onResolve({ filter: /^(path)|(node:path)$/ }, () => {
            return {
              path: path.resolve(rootPath, "polyfills/esm/path.mjs"),
              namespace: NAMESPACE
            };
          });
        }
        if (nodeFills.querystring) {
          build.onResolve(
            { filter: /^(querystring)|(node:querystring)$/ },
            () => {
              return {
                path: path.resolve(rootPath, "polyfills/esm/querystring.mjs"),
                namespace: NAMESPACE
              };
            }
          );
        }
        if (nodeFills.os) {
          build.onResolve({ filter: /^(os)|(node:os)$/ }, () => {
            return {
              path: path.resolve(rootPath, "polyfills/esm/node-os.mjs"),
              namespace: NAMESPACE
            };
          });
        }
      }
      if (program.config.customPolyfills) {
        for (const customPoly of program.config.customPolyfills) {
          if (customPoly.importName) {
            build.onResolve({ filter: /.*/ }, (arg) => {
              if (customPoly.importName === arg.path) {
                return {
                  path: customPoly.filepath,
                  namespace: NAMESPACE
                };
              }
            });
          }
        }
      }
      if (config.polyfills?.node || program.config.customPolyfills) {
        build.onLoad(
          {
            filter: /.*/,
            namespace: NAMESPACE
          },
          (args) => {
            return {
              contents: (
                /* js */
                `
                import * as _mod from "${args.path}";
                const _default = _mod.default ?? _mod;
                export default _default;
                export * from "${args.path}";
              `.trim()
              ),
              resolveDir: program.cwd
            };
          }
        );
      }
    }
  };
};
export {
  importPolyfillsPlugin
};
