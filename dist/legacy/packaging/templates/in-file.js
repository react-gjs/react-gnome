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

// src/packaging/templates/in-file.ts
var in_file_exports = {};
__export(in_file_exports, {
  getInFile: () => getInFile
});
module.exports = __toCommonJS(in_file_exports);
var import_app_id_to_path = require("../../utils/app-id-to-path.js");
var getInFile = (params) => (
  /* js */
  `
#!@GJS@

imports.package.init({
    name: '${params.appID}',
    version: '@PACKAGE_VERSION@',
    prefix: '@prefix@',
    libdir: '@libdir@',
});

Object.assign(globalThis, {
  MAIN_LOOP_NAME: "react-gnome-app:main-loop"
});

import('resource:///${(0, import_app_id_to_path.appIDToPath)(params.appID)}/js/main.js')
  .then((main) => {
    imports.package.run(main)
  })
  .catch(error => {
    console.error(error);
    imports.system.exit(1);
  });

// Main Loop must be started from this entry file, or otherwise all Promises block until main loop exits
// See https://gitlab.gnome.org/GNOME/gjs/-/issues/468 for more details
imports.mainloop.run(MAIN_LOOP_NAME);
`.trim()
);
