import type { AdditionalPlugins } from "../utils/get-plugins";
import { BuildProgram } from "./build-program";
export declare class StartProgram extends BuildProgram {
    protected getBuildDirPath(): string;
    additionalPlugins(): AdditionalPlugins;
    protected beforeStart(): Promise<void>;
}
