import { pipeline } from "node:stream/promises";

export type PipeTransformer = (chunk: string | Buffer) => string | Buffer;

const isAbortError = (e: unknown): e is Error => {
  return (
    typeof e === "object" &&
    e !== null &&
    e instanceof Error &&
    e.name === "AbortError"
  );
};

export class OutputPipe {
  private transformers: PipeTransformer[] = [];
  private controller = new AbortController();

  constructor(
    private source: NodeJS.ReadableStream,
    private output: NodeJS.WritableStream
  ) {}

  private transform(chunk: string | Buffer): string | Buffer {
    let result = chunk;
    for (const transformer of this.transformers) {
      result = transformer(result);
    }
    return result;
  }

  addTransformer(transformer: PipeTransformer) {
    this.transformers.push(transformer);
    return this;
  }

  start() {
    const self = this;

    pipeline(
      this.source,
      async function* (source: NodeJS.ReadableStream) {
        source.setEncoding("utf8");
        for await (const chunk of source) {
          yield self.transform(chunk);
        }
      },
      this.output,
      { signal: this.controller.signal }
    ).catch((e) => {
      if (!isAbortError(e)) {
        console.error(e);
      }
    });

    return this;
  }

  stop() {
    try {
      this.controller.abort();
    } catch (e) {
      if (!isAbortError(e)) {
        console.error(e);
      }
    }

    return this;
  }
}
