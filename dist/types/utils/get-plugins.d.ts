import type esbuild from "esbuild";
import type { Program } from "../programs/base";
export type AdditionalPlugins = {
    before?: esbuild.Plugin[];
    after?: esbuild.Plugin[];
};
export declare const getPlugins: (program: Program) => {
    name: string;
    setup(build: esbuild.PluginBuild): void;
}[];
