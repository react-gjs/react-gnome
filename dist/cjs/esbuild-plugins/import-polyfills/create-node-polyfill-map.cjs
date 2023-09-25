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

// src/esbuild-plugins/import-polyfills/create-node-polyfill-map.ts
var create_node_polyfill_map_exports = {};
__export(create_node_polyfill_map_exports, {
  createNodePolyfillMap: () => createNodePolyfillMap
});
module.exports = __toCommonJS(create_node_polyfill_map_exports);
var import_path = __toESM(require("path"));
var import_get_dirpath = require("../../get-dirpath/get-dirpath.cjs");
var createNodePolyfillMap = (polyfills) => {
  const rootPath = (0, import_get_dirpath.getDirPath)();
  return {
    addResolvers(program, build) {
      for (const pollyfill of polyfills) {
        if (pollyfill.configFlag(program.config)) {
          build.onResolve({ filter: pollyfill.matcher }, (args) => {
            return build.resolve(
              import_path.default.join(rootPath, "polyfills/esm", pollyfill.filename),
              {
                resolveDir: rootPath,
                kind: args.kind,
                importer: args.importer
              }
            );
          });
        }
      }
    }
  };
};
