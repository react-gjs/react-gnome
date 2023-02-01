/// <reference types="node" />
/// <reference types="node" />
export type PipeTransformer = (chunk: string | Buffer) => string | Buffer;
export declare class OutputPipe {
    private source;
    private output;
    private transformers;
    private controller;
    constructor(source: NodeJS.ReadableStream, output: NodeJS.WritableStream);
    private transform;
    addTransformer(transformer: PipeTransformer): this;
    start(): this;
    stop(): this;
}
