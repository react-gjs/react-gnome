// src/utils/get-plugins.ts
import { nodePkgPolyfillsPlugin } from "../esbuild-plugins/node-pkg-polyfills/node-pkg-polyfills.mjs";
import { reactGnomePlugin } from "../esbuild-plugins/react-gnome/react-gnome-plugin.mjs";
import { watchLoggerPlugin } from "../esbuild-plugins/watch-logger/watch-logger-plugin.mjs";
var getPlugins = (program) => {
  const additionalPlugins = program.additionalPlugins();
  const plugins = [nodePkgPolyfillsPlugin(program), reactGnomePlugin(program)];
  if (additionalPlugins.before) {
    plugins.push(...additionalPlugins.before);
  }
  if (program.watchMode) {
    plugins.push(watchLoggerPlugin());
  }
  if (program.config.esbuildPlugins) {
    plugins.push(...program.config.esbuildPlugins);
  }
  if (additionalPlugins.after) {
    plugins.push(...additionalPlugins.after);
  }
  return plugins;
};
export {
  getPlugins
};
