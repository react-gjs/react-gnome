"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
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
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};

// src/utils/app-resources.ts
var app_resources_exports = {};
__export(app_resources_exports, {
  AppResources: () => AppResources
});
module.exports = __toCommonJS(app_resources_exports);
var import_path = __toESM(require("path"));
var import_app_id_to_path = require("./app-id-to-path.cjs");
var import_generate_unique_name = require("./generate-unique-name.cjs");
var AppResource = class {
  constructor(origin, appID) {
    this.origin = origin;
    this.appID = appID;
    __publicField(this, "uid", (0, import_generate_unique_name.generateUniqueName)(8));
  }
  get name() {
    return this.uid + "-" + import_path.default.basename(this.origin);
  }
  get fullPath() {
    return import_path.default.resolve(this.origin);
  }
  get resourceString() {
    return `resource:///${(0, import_app_id_to_path.appIDToPath)(this.appID)}/${this.name}`;
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
