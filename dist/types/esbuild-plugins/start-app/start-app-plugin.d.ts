import type esbuild from "esbuild";
import type { Program } from "../../programs/base";
export declare const startAppPlugin: (params: {
    getCwd: () => string;
    beforeStart?: () => any;
    program: Program;
}) => {
    name: string;
    setup(build: esbuild.PluginBuild): void;
};
