import type esbuild from "esbuild";
import type { Program } from "../../programs/base";
export declare const importPolyfillsPlugin: (program: Program) => {
    name: string;
    setup(build: esbuild.PluginBuild): void;
};
