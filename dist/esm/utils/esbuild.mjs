var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};

// src/utils/esbuild.ts
import esbuild from "esbuild";
var ESBuild = class {
  constructor() {
    __publicField(this, "ctx");
    __publicField(this, "watch", false);
  }
  get isWatching() {
    return this.watch;
  }
  async init(options, watch) {
    this.watch = watch;
    this.ctx = await esbuild.context(options);
  }
  async start() {
    if (this.watch) {
      await this.ctx.watch();
    } else {
      await this.ctx.rebuild();
    }
  }
  async dispose() {
    if (this.ctx) {
      await this.ctx.dispose();
    }
  }
  async cancel() {
    await this.ctx.cancel();
  }
};
export {
  ESBuild
};
