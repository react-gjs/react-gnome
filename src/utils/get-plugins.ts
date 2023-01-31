import type esbuild from "esbuild";
import { importPolyfillsPlugin } from "../esbuild-plugins/import-polyfills/import-polyfills";
import { reactGnomePlugin } from "../esbuild-plugins/react-gnome/react-gnome-plugin";
import { watchLoggerPlugin } from "../esbuild-plugins/watch-logger/watch-logger-plugin";
import type { Program } from "../programs/base";

export type AdditionalPlugins = {
  before?: esbuild.Plugin[];
  after?: esbuild.Plugin[];
};

export const getPlugins = (program: Program) => {
  const additionalPlugins = program.additionalPlugins();

  const plugins = [importPolyfillsPlugin(program), reactGnomePlugin(program)];

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
