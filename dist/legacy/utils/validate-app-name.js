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

// src/utils/validate-app-name.ts
var validate_app_name_exports = {};
__export(validate_app_name_exports, {
  validateAppName: () => validateAppName
});
module.exports = __toCommonJS(validate_app_name_exports);
var errInvalidAppName = () => {
  throw new Error("Invalid application name.");
};
var validateAppName = (appName) => {
  if (appName.length === 0) {
    return errInvalidAppName();
  }
  if (appName.startsWith("-") || appName.endsWith("-") || appName.startsWith("_") || appName.endsWith("_")) {
    return errInvalidAppName();
  }
  return appName;
};
