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

// src/packaging/templates/data/busname.ts
var busname_exports = {};
__export(busname_exports, {
  getDataBusname: () => getDataBusname
});
module.exports = __toCommonJS(busname_exports);
var getDataBusname = (params) => `
[Unit]
# Optional
Description=${params.appID}
# Optional (obviously)
Documentation=${params.documentationUrl ?? "https://github.com"}

[BusName]
# Optional
Name=${params.appID}
# Optional
Service=${params.appID}.service
`.trim();
