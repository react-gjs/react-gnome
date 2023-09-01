import type esbuild from "esbuild";
import type { Config } from "../../config/config-type";
import type { DeepReadonly, Program } from "../../programs/base";
type PolyfillMapDef = {
    matcher: RegExp;
    configFlag: (config: DeepReadonly<Config>) => boolean;
    filename: string;
};
export declare const createNodePolyfillMap: (polyfills: Array<PolyfillMapDef>) => {
    addResolvers(program: Program, build: esbuild.PluginBuild): void;
};
export {};
