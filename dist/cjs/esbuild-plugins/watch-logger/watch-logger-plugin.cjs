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

// src/esbuild-plugins/watch-logger/watch-logger-plugin.ts
var watch_logger_plugin_exports = {};
__export(watch_logger_plugin_exports, {
  watchLoggerPlugin: () => watchLoggerPlugin
});
module.exports = __toCommonJS(watch_logger_plugin_exports);
var import_termx_markup = require("termx-markup");
var watchLoggerPlugin = () => {
  let isFirstBuild = true;
  return {
    name: "react-gnome-watch-logger-esbuild-plugin",
    setup(build) {
      build.onStart(() => {
        if (!isFirstBuild) {
          import_termx_markup.Output.print(
            import_termx_markup.html`<span color="yellow">Changes detected, rebuilding...</span>`
          );
        } else {
          isFirstBuild = false;
        }
      });
    }
  };
};
