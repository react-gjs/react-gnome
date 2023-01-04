import type esbuild from "esbuild";
import type { Config } from "../../config/config-schema";

export const nodePkgPolyfillsPlugin = (config: Config) => {
  return {
    name: "react-gnome-node-pkg-polyfills-esbuild-plugin",
    setup(build: esbuild.PluginBuild) {
      if (config.polyfills?.node) {
        const nodeFills = config.polyfills.node;

        if (nodeFills.path) {
          build.onResolve({ filter: /^(path)|(node:path)$/ }, () => {
            return {
              path: "path-browserify",
            };
          });
        }

        if (nodeFills.fs) {
          build.onResolve({ filter: /^(fs)|(node:fs)$/ }, () => {
            return {
              path: "react-gnome/polyfills/fs.mjs",
            };
          });

          build.onResolve(
            { filter: /^(fs\/promises)|(node:fs\/promises)$/ },
            () => {
              return {
                path: "react-gnome/polyfills/fs-promises.mjs",
              };
            }
          );
        }
      }
    },
  };
};
