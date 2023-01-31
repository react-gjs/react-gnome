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

// src/config/parse-config.ts
var parse_config_exports = {};
__export(parse_config_exports, {
  parseConfig: () => parseConfig
});
module.exports = __toCommonJS(parse_config_exports);
var import_dilswer = require("dilswer");
var import_promises = __toESM(require("fs/promises"));
var import_path = __toESM(require("path"));
var import_config_schema = require("./config-schema.js");
var import_eval_js_config = require("./eval-js-config/eval-js-config.js");
async function parseJsonConfig(filePath) {
  const fileData = await import_promises.default.readFile(filePath, "utf-8");
  const config = JSON.parse(fileData);
  (0, import_dilswer.assertDataType)(import_config_schema.ConfigSchema, config);
  return config;
}
async function parseJsConfig(filePath, context) {
  const getConfig = await (0, import_eval_js_config.evalJsConfigFile)(filePath);
  const config = getConfig(context);
  (0, import_dilswer.assertDataType)(import_config_schema.ConfigSchema, config);
  return config;
}
function parseConfig(filePath, context) {
  const p = import_path.default.parse(filePath);
  if (p.ext === ".json") {
    return parseJsonConfig(filePath);
  } else if ([".js", ".cjs", ".mjs", ".ts", ".cts", ".mts"].includes(p.ext)) {
    return parseJsConfig(filePath, context);
  } else {
    throw new Error(`Unsupported config file type: '${p.ext}'.`);
  }
}
