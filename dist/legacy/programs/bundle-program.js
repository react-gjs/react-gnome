"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
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
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};

// src/programs/bundle-program.ts
var bundle_program_exports = {};
__export(bundle_program_exports, {
  BundleProgram: () => BundleProgram
});
module.exports = __toCommonJS(bundle_program_exports);
var import_path = __toESM(require("path"));
var import_termx_markup = require("termx-markup");
var import_get_plugins = require("../utils/get-plugins.js");
var import_get_polyfills = require("../utils/get-polyfills.js");
var import_base = require("./base.js");
var import_default_build_options = require("./default-build-options.js");
var BundleProgram = class extends import_base.Program {
  constructor() {
    super(...arguments);
    __publicField(this, "type", "bundle");
  }
  additionalPlugins() {
    return {};
  }
  /**
   * @internal
   */
  async main() {
    if (this.watchMode) {
      import_termx_markup.Output.print(import_termx_markup.html`
        <span color="lightBlue"> Building in watch mode... </span>
      `);
    } else {
      import_termx_markup.Output.print(import_termx_markup.html` <span color="lightBlue"> Building... </span> `);
    }
    const polyfills = await (0, import_get_polyfills.getGlobalPolyfills)(this);
    await this.esbuildCtx.init(
      (0, import_default_build_options.createBuildOptions)({
        banner: { js: polyfills.bundle },
        entryPoints: [import_path.default.resolve(this.cwd, this.config.entrypoint)],
        outfile: import_path.default.resolve(this.cwd, this.config.outDir, "index.js"),
        plugins: (0, import_get_plugins.getPlugins)(this, { giRequirements: polyfills.requirements }),
        minify: this.config.minify ?? (this.isDev ? false : true),
        treeShaking: this.config.treeShake ?? (this.isDev ? false : true)
      }),
      this.watchMode
    );
    await this.esbuildCtx.start();
    if (!this.watchMode) {
      import_termx_markup.Output.print(import_termx_markup.html` <span color="lightGreen">Build completed.</span> `);
    }
  }
};
