import type esbuild from "esbuild";
import type { Program } from "../../programs/base";
export declare const POLYFILL_IMPORT_NS = "react-gnome-polyfills";
export declare const importPolyfillsPlugin: (program: Program) => {
    name: string;
    setup(build: esbuild.PluginBuild): void;
};
