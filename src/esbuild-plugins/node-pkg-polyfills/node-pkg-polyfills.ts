import type esbuild from "esbuild";
import type { Program } from "../../programs/base";

export const nodePkgPolyfillsPlugin = (program: Program) => {
  const config = program.config;
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
