// src/esbuild-plugins/node-pkg-polyfills/node-pkg-polyfills.ts
var nodePkgPolyfillsPlugin = (program) => {
  const config = program.config;
  return {
    name: "react-gnome-node-pkg-polyfills-esbuild-plugin",
    setup(build) {
      if (config.polyfills?.node) {
        const nodeFills = config.polyfills.node;
        if (nodeFills.path) {
          build.onResolve({ filter: /^(path)|(node:path)$/ }, () => {
            return {
              path: "path-browserify"
            };
          });
        }
      }
    }
  };
};
export {
  nodePkgPolyfillsPlugin
};
