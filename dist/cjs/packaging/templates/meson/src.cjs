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

// src/packaging/templates/meson/src.ts
var src_exports = {};
__export(src_exports, {
  getSrcMesonBuild: () => getSrcMesonBuild
});
module.exports = __toCommonJS(src_exports);
var getSrcMesonBuild = () => `

application = configure_file(
  output : app_id,
  input : '@0@.in'.format(app_id),
  configuration: app_configuration,
  install: true,
  install_dir: pkgdatadir
)

application_resource = gnome.compile_resources(
  '@0@.src'.format(app_id),
  configure_file(
    input: '@0@.src.gresource.xml.in'.format(app_id),
    output: '@0@.src.gresource.xml'.format(app_id),
    configuration: app_configuration,
  ),
  gresource_bundle: true,
  install: true,
  install_dir : pkgdatadir
)

run_target('run', 
  command: application,
  depends: application_resource
)
`.trim();
