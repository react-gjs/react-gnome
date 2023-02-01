"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if ((from && typeof from === "object") || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, {
          get: () => from[key],
          enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable,
        });
  }
  return to;
};
var __toCommonJS = (mod) =>
  __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/esbuild-plugins/node-pkg-polyfills/node-pkg-polyfills.ts
var node_pkg_polyfills_exports = {};
__export(node_pkg_polyfills_exports, {
  nodePkgPolyfillsPlugin: () => nodePkgPolyfillsPlugin,
});
module.exports = __toCommonJS(node_pkg_polyfills_exports);
var nodePkgPolyfillsPlugin = (program) => {
  const config = program.config;
  return {
    name: "react-gnome-node-pkg-polyfills-esbuild-plugin",
    setup(build) {
      if (config.polyfills?.node) {
        const nodeFills = config.polyfills.node;
        if (nodeFills.path) {
          build.onResolve({ filter: /^(path)|(node:path)$/ }, () => {
            return {
              path: "path-browserify",
            };
          });
        }
      }
    },
  };
};
