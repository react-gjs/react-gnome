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
      }
    },
  };
};
