var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};

// src/utils/output-pipe.ts
import { pipeline } from "node:stream/promises";
var isAbortError = (e) => {
  return typeof e === "object" && e !== null && e instanceof Error && e.name === "AbortError";
};
var OutputPipe = class {
  constructor(source, output) {
    this.source = source;
    this.output = output;
    __publicField(this, "transformers", []);
    __publicField(this, "controller", new AbortController());
  }
  transform(chunk) {
    let result = chunk;
    for (const transformer of this.transformers) {
      result = transformer(result);
    }
    return result;
  }
  addTransformer(transformer) {
    this.transformers.push(transformer);
    return this;
  }
  start() {
    const self = this;
    pipeline(
      this.source,
      async function* (source) {
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
};
export {
  OutputPipe
};
