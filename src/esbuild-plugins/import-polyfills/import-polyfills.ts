import type esbuild from "esbuild";
import path from "path";
import { getDirPath } from "../../get-dirpath/get-dirpath";
import type { Program } from "../../programs/base";

export const importPolyfillsPlugin = (program: Program) => {
  const config = program.config;
  return {
    name: "react-gnome-import-polyfills-esbuild-plugin",
    setup(build: esbuild.PluginBuild) {
      const rootPath = getDirPath();

      if (config.polyfills?.node) {
        const nodeFills = config.polyfills.node;

        if (nodeFills.path) {
          build.onResolve({ filter: /^(path)|(node:path)$/ }, () => {
            return {
              path: path.resolve(rootPath, "polyfills/esm/path.mjs"),
              namespace: "rgpolyfill",
            };
          });
        }

        if (program.config.customPolyfills) {
          for (const customPoly of program.config.customPolyfills) {
            if (customPoly.importName) {
              build.onResolve({ filter: /.*/ }, (arg) => {
                if (customPoly.importName === arg.path) {
                  return {
                    path: customPoly.filepath,
                    namespace: "rgpolyfill",
                  };
                }
              });
            }
          }
        }

        build.onLoad(
          {
            filter: /.*/,
            namespace: "rgpolyfill",
          },
          (args) => {
            return {
              contents: `export * from "${args.path}";`,
              resolveDir: program.cwd,
            };
          }
        );
      }
    },
  };
};
