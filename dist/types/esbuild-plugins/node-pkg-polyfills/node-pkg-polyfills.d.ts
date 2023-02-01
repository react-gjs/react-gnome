import type esbuild from "esbuild";
import type { Program } from "../../programs/base";
export declare const nodePkgPolyfillsPlugin: (program: Program) => {
  name: string;
  setup(build: esbuild.PluginBuild): void;
};
