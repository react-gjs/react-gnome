import type esbuild from "esbuild";
import { importPolyfillsPlugin } from "../esbuild-plugins/import-polyfills/import-polyfills";
import {
  ReactGtkEsbuildPluginOptions,
  reactGtkPlugin,
} from "../esbuild-plugins/react-gtk/react-gtk-plugin";
import { watchLoggerPlugin } from "../esbuild-plugins/watch-logger/watch-logger-plugin";
import type { Program } from "../programs/base";

export type AdditionalPlugins = {
  before?: esbuild.Plugin[];
  after?: esbuild.Plugin[];
};

export const getPlugins = (
  program: Program,
  options?: ReactGtkEsbuildPluginOptions,
) => {
  const additionalPlugins = program.additionalPlugins();

  const plugins = [
    importPolyfillsPlugin(program),
    reactGtkPlugin(program, options),
  ];

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
