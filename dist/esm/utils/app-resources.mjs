var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};

// src/utils/app-resources.ts
import path from "path";
import { appIDToPath } from "./app-id-to-path.mjs";
import { generateUniqueName } from "./generate-unique-name.mjs";
var AppResource = class {
  constructor(origin, appID) {
    this.origin = origin;
    this.appID = appID;
    __publicField(this, "uid", generateUniqueName(8));
  }
  get name() {
    return this.uid + "-" + path.basename(this.origin);
  }
  get fullPath() {
    return path.resolve(this.origin);
  }
  get resourceString() {
    return `resource:///${appIDToPath(this.appID)}/${this.name}`;
  }
};
var AppResources = class {
  constructor(appID) {
    this.appID = appID;
    __publicField(this, "resources", /* @__PURE__ */ new Map());
  }
  registerResource(origin) {
    if (this.resources.has(origin))
      return this.resources.get(origin);
    const resource = new AppResource(origin, this.appID);
    this.resources.set(origin, resource);
    return resource;
  }
  getAll() {
    return [...this.resources.values()];
  }
};
export {
  AppResources
};
