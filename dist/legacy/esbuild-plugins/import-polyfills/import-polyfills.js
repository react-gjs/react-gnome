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

// src/esbuild-plugins/import-polyfills/import-polyfills.ts
var import_polyfills_exports = {};
__export(import_polyfills_exports, {
  importPolyfillsPlugin: () => importPolyfillsPlugin
});
module.exports = __toCommonJS(import_polyfills_exports);
var import_path = __toESM(require("path"));
var import_get_dirpath = require("../../get-dirpath/get-dirpath.js");
var NAMESPACE = "react-gnome-polyfills";
var importPolyfillsPlugin = (program) => {
  const config = program.config;
  return {
    name: "react-gnome-import-polyfills-esbuild-plugin",
    setup(build) {
      const rootPath = (0, import_get_dirpath.getDirPath)();
      if (config.polyfills?.node) {
        const nodeFills = config.polyfills.node;
        if (nodeFills.path) {
          build.onResolve({ filter: /^(path)|(node:path)$/ }, () => {
            return {
              path: import_path.default.resolve(rootPath, "polyfills/esm/path.mjs"),
              namespace: NAMESPACE
            };
          });
        }
        if (nodeFills.querystring) {
          build.onResolve(
            { filter: /^(querystring)|(node:querystring)$/ },
            () => {
              return {
                path: import_path.default.resolve(rootPath, "polyfills/esm/querystring.mjs"),
                namespace: NAMESPACE
              };
            }
          );
        }
        if (nodeFills.os) {
          build.onResolve({ filter: /^(os)|(node:os)$/ }, () => {
            return {
              path: import_path.default.resolve(rootPath, "polyfills/esm/node-os.mjs"),
              namespace: NAMESPACE
            };
          });
        }
      }
      if (program.config.customPolyfills) {
        for (const customPoly of program.config.customPolyfills) {
          if (customPoly.importName) {
            build.onResolve({ filter: /.*/ }, (arg) => {
              if (customPoly.importName === arg.path) {
                return {
                  path: customPoly.filepath,
                  namespace: NAMESPACE
                };
              }
            });
          }
        }
      }
      if (config.polyfills?.node || program.config.customPolyfills) {
        build.onLoad(
          {
            filter: /.*/,
            namespace: NAMESPACE
          },
          (args) => {
            return {
              contents: `export * from "${args.path}";`,
              resolveDir: program.cwd
            };
          }
        );
      }
    }
  };
};
