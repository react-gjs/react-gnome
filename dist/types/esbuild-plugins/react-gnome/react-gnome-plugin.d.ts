import type esbuild from "esbuild";
import type { Program } from "../../programs/base";
export type GnomePluginOptions = {
    giRequirements?: [string, string | undefined][];
};
export declare const reactGnomePlugin: (program: Program, options: GnomePluginOptions) => {
    name: string;
    setup(build: esbuild.PluginBuild): void;
};
