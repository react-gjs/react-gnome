import type esbuild from "esbuild";
import type { GnomePluginOptions } from "../esbuild-plugins/react-gnome/react-gnome-plugin";
import type { Program } from "../programs/base";
export type AdditionalPlugins = {
    before?: esbuild.Plugin[];
    after?: esbuild.Plugin[];
};
export declare const getPlugins: (program: Program, options: GnomePluginOptions) => {
    name: string;
    setup(build: esbuild.PluginBuild): void;
}[];
