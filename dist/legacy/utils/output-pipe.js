"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};

// src/utils/output-pipe.ts
var output_pipe_exports = {};
__export(output_pipe_exports, {
  OutputPipe: () => OutputPipe
});
module.exports = __toCommonJS(output_pipe_exports);
var import_promises = require("node:stream/promises");
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
    (0, import_promises.pipeline)(
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
