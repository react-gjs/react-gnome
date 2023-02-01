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

// src/utils/env-vars.ts
var env_vars_exports = {};
__export(env_vars_exports, {
  EnvVars: () => EnvVars
});
module.exports = __toCommonJS(env_vars_exports);
var EnvVars = class {
  constructor() {
    __publicField(this, "defined", /* @__PURE__ */ new Map());
  }
  define(name, value) {
    this.defined.set(name, value);
  }
  toJavascriptModule() {
    return `export default { ${Array.from(this.defined).map(([name, value]) => `${name}: ${JSON.stringify(value)}`).join(", ")} }`;
  }
};
