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
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/programs/default-build-options.ts
var default_build_options_exports = {};
__export(default_build_options_exports, {
  createBuildOptions: () => createBuildOptions
});
module.exports = __toCommonJS(default_build_options_exports);
var consoleLogReplacement = (
  /**
  * Js
  */
  `
const __console_proxy = {
  log: console.log?.bind(console),
  info: console.info?.bind(console),
  warn: console.warn?.bind(console),
  error: console.error?.bind(console),
  debug: console.debug?.bind(console),
  group: console.group?.bind(console),
  groupEnd: console.groupEnd?.bind(console),
  groupCollapsed: console.groupCollapsed?.bind(console),
  table: console.table?.bind(console),
  dir: console.dir?.bind(console),
  dirxml: console.dirxml?.bind(console),
  trace: console.trace?.bind(console),
  clear: console.clear?.bind(console),
  count: console.count?.bind(console),
  countReset: console.countReset?.bind(console),
  assert: console.assert?.bind(console),
  profile: console.profile?.bind(console),
  profileEnd: console.profileEnd?.bind(console)
};
`
);
var defaultBuildOptions = {
  target: "es2022",
  format: "esm",
  jsx: "transform",
  keepNames: true,
  bundle: true,
  banner: {
    js: consoleLogReplacement
  },
  define: {
    console: "__console_proxy"
  }
};
var createBuildOptions = (options) => {
  return {
    ...defaultBuildOptions,
    ...options,
    define: {
      ...defaultBuildOptions.define,
      ...options.define ?? {}
    },
    banner: {
      ...options.banner,
      js: defaultBuildOptions.banner.js + (options.banner?.js ? "\n" + options.banner.js : "")
    }
  };
};
