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

// src/utils/left-pad.ts
var left_pad_exports = {};
__export(left_pad_exports, {
  leftPad: () => leftPad
});
module.exports = __toCommonJS(left_pad_exports);
var leftPad = (str, length, char = " ") => {
  char = char[0] ?? " ";
  const pad = char.repeat(length);
  const lines = str.split("\n");
  return lines.map((line) => `${pad}${line}`).join("\n");
};
