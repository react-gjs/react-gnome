import { Argument } from "clify.js";
import type { Config } from "../config/config-type";
import type { AppResources } from "../utils/app-resources";
import { EnvVars } from "../utils/env-vars";
import { ESBuild } from "../utils/esbuild";
import type { AdditionalPlugins } from "../utils/get-plugins";
export type DeepReadonly<T> = {
    readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : Readonly<T[P]>;
};
type MapArgRecord<A extends Record<string, Argument<any, any>>> = {
    [K in keyof A]: A[K]["value"];
};
export declare abstract class Program {
    type: "build" | "bundle" | "init" | "start";
    envs: EnvVars;
    config: DeepReadonly<Config>;
    cwd: string;
    resources?: AppResources;
    esbuildCtx: ESBuild;
    readonly args: {
        readonly watch: Argument<"boolean", false>;
        readonly mode: Argument<"string", false>;
    };
    get isDev(): boolean;
    get watchMode(): boolean;
    get appName(): string;
    get appID(): string;
    abstract additionalPlugins(): AdditionalPlugins;
    private populateDefaultEnvVars;
    runWith(args: MapArgRecord<this["args"]>, config: Config, workingDir?: string): Promise<any>;
}
export {};
