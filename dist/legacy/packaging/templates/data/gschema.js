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

// src/packaging/templates/data/gschema.ts
var gschema_exports = {};
__export(gschema_exports, {
  getDataGSchema: () => getDataGSchema
});
module.exports = __toCommonJS(gschema_exports);
var import_app_id_to_path = require("../../../utils/app-id-to-path.js");
var getDataGSchema = (params) => (
  /* xml */
  `
<?xml version="1.0" encoding="UTF-8"?>
<schemalist gettext-domain="${params.appID}">
  <schema id="${params.appID}" path="/${(0, import_app_id_to_path.appIDToPath)(params.appID)}/">
  </schema>
</schemalist>
`.trim()
);
