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

// src/utils/validate-prefix.ts
var validate_prefix_exports = {};
__export(validate_prefix_exports, {
  validatePrefix: () => validatePrefix
});
module.exports = __toCommonJS(validate_prefix_exports);
var errInvalidPrefix = () => {
  throw new Error("Invalid application prefix.");
};
var validatePrefix = (prefix) => {
  const parts = prefix.split(".");
  if (parts.length === 0 || parts[0].length === 0) {
    return errInvalidPrefix();
  }
  for (const part of parts) {
    if (!part) {
      return errInvalidPrefix();
    }
    if (part.startsWith("-") || part.endsWith("-") || part.startsWith("_") || part.endsWith("_")) {
      return errInvalidPrefix();
    }
    if (/^[^\w\d_-]$/.test(part)) {
      return errInvalidPrefix();
    }
  }
  return prefix;
};
