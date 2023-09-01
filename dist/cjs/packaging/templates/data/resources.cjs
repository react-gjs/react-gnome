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

// src/packaging/templates/data/resources.ts
var resources_exports = {};
__export(resources_exports, {
  getDataResources: () => getDataResources
});
module.exports = __toCommonJS(resources_exports);
var import_app_id_to_path = require("../../../utils/app-id-to-path.cjs");
var getDataResources = (params) => (
  /* xml */
  `
<?xml version="1.0" encoding="UTF-8"?>
<gresources>
  <gresource prefix="/${(0, import_app_id_to_path.appIDToPath)(params.appID)}">${params.files ? "\n" + params.files.map((f) => (
    /* xml */
    `    <file>${f}</file>`
  )).join("\n") : ""}
  </gresource>
</gresources>
`.trim()
);
