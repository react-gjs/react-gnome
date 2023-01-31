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

// src/packaging/templates/data/appdata.ts
var appdata_exports = {};
__export(appdata_exports, {
  getAppData: () => getAppData
});
module.exports = __toCommonJS(appdata_exports);
var getAppData = (params) => (
  /* xml */
  `
<?xml version="1.0" encoding="UTF-8"?>
<component type="desktop">
  <id>${params.appID}</id>
  <name>${params.friendlyName}</name>
  <licence>${params.license}</licence>
  <project_group>GNOME</project_group>
  <launchable type="desktop-id">${params.appID}.desktop</launchable>
  <description>
  </description>
</component>
`.trim()
);
