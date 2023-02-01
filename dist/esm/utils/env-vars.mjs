var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};

// src/utils/env-vars.ts
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
export {
  EnvVars
};
