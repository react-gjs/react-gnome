import esbuild from "esbuild";
export declare class ESBuild {
    private ctx;
    private watch?;
    get isWatching(): boolean | undefined;
    init(options: esbuild.BuildOptions, watch?: boolean): Promise<void>;
    start(): Promise<void>;
    dispose(): Promise<void>;
    cancel(): Promise<void>;
}
