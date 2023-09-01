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

// src/build.ts
var build_exports = {};
__export(build_exports, {
  BuildProgram: () => import_build_program.BuildProgram,
  BundleProgram: () => import_bundle_program.BundleProgram,
  StartProgram: () => import_start_program.StartProgram,
  build: () => build
});
module.exports = __toCommonJS(build_exports);
var import_clify = require("clify.js");
var import_build_program = require("./programs/build-program.cjs");
var import_bundle_program = require("./programs/bundle-program.cjs");
var import_init_program = require("./programs/init-program.cjs");
var import_start_program = require("./programs/start-program.cjs");
async function build() {
  (0, import_clify.configure)((main) => {
    main.setDisplayName("react-gnome");
    main.setDescription("Build GTK apps with React.");
    const bundleCmd = main.addSubCommand("bundle", () => new import_bundle_program.BundleProgram());
    const buildCmd = main.addSubCommand("build", () => new import_build_program.BuildProgram());
    const startCmd = main.addSubCommand("start", () => new import_start_program.StartProgram());
    const initCmd = main.addSubCommand("init", () => new import_init_program.InitProgram());
    bundleCmd.setDescription(
      "Create a bundled js file, without the tarball or meson configuration. This is useful if you want to manage the build process yourself."
    );
    buildCmd.setDescription(
      "Create a tarball and meson configuration thats ready to be installed."
    );
    startCmd.setDescription("Build and run the app immediately after.");
    initCmd.setDescription(
      "Initialize a new project with the necessary files and scripts."
    );
  });
}
