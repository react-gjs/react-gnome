import { Argument } from "clify.js";
export declare class InitProgram {
    readonly type = "init";
    packageManager: Argument<"string", false>;
    run(): void;
}
