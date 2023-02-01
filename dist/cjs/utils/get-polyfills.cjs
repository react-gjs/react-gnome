"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
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

// src/utils/get-polyfills.ts
var get_polyfills_exports = {};
__export(get_polyfills_exports, {
  getPolyfills: () => getPolyfills
});
module.exports = __toCommonJS(get_polyfills_exports);
var import_path = __toESM(require("path"));
var import_get_dirpath = require("../get-dirpath/get-dirpath.cjs");
var getPolyfills = (program) => {
  const polyfills = { ...program.config.polyfills };
  if (polyfills?.XMLHttpRequest) {
    polyfills.URL = true;
  }
  if (polyfills?.URL || polyfills.node?.querystring) {
    polyfills.Buffer = true;
  }
  const polyfillPaths = [];
  const rootPath = (0, import_get_dirpath.getDirPath)();
  if (polyfills?.fetch) {
    polyfillPaths.push(import_path.default.resolve(rootPath, "polyfills/esm/fetch.mjs"));
  }
  if (polyfills?.Buffer) {
    polyfillPaths.push(import_path.default.resolve(rootPath, "polyfills/esm/buffer.mjs"));
  }
  if (polyfills?.Blob) {
    polyfillPaths.push(import_path.default.resolve(rootPath, "polyfills/esm/blob.mjs"));
  }
  if (polyfills?.URL) {
    polyfillPaths.push(import_path.default.resolve(rootPath, "polyfills/esm/url.mjs"));
  }
  if (polyfills?.FormData) {
    polyfillPaths.push(import_path.default.resolve(rootPath, "polyfills/esm/form-data.mjs"));
  }
  if (polyfills?.XMLHttpRequest) {
    polyfillPaths.push(
      import_path.default.resolve(rootPath, "polyfills/esm/xml-http-request.mjs")
    );
  }
  if (polyfills?.base64) {
    polyfillPaths.push(import_path.default.resolve(rootPath, "polyfills/esm/base64.mjs"));
  }
  if (polyfills?.AbortController) {
    polyfillPaths.push(
      import_path.default.resolve(rootPath, "polyfills/esm/abort-controller.mjs")
    );
  }
  if (program.config.customPolyfills) {
    for (const customPoly of program.config.customPolyfills) {
      if (!customPoly.importName)
        polyfillPaths.push(import_path.default.resolve(program.cwd, customPoly.filepath));
    }
  }
  return polyfillPaths;
};
