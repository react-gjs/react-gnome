import type { Program } from "../programs/base";
export type Polyfills = {
    bundle: string;
    requirements: [string, string | undefined][];
};
export declare const getGlobalPolyfills: (program: Program) => Promise<Polyfills>;
