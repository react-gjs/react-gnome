import { BuildProgram } from "./programs/build-program";
import { BundleProgram } from "./programs/bundle-program";
import { StartProgram } from "./programs/start-program";
/** Invokes the CLI program that builds the app. */
export declare function build(): Promise<void>;
export { BundleProgram, BuildProgram, StartProgram };
