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

// src/programs/init-program.ts
var init_program_exports = {};
__export(init_program_exports, {
  InitProgram: () => InitProgram
});
module.exports = __toCommonJS(init_program_exports);
var import_clify = require("clify.js");
var import_fs = __toESM(require("fs"));
var import_path = __toESM(require("path"));
var import_termx_markup = require("termx-markup");
var import_config_file = require("../init-project/config-file.js");
var import_entry_file = require("../init-project/entry-file.js");
var PackageManagerArg = import_clify.Argument.define({
  flagChar: "-p",
  keyword: "--package-manager",
  description: "The package manager to use for scripts.",
  dataType: "string"
});
var InitProgram = class {
  constructor() {
    __publicField(this, "packageManager", new PackageManagerArg());
  }
  run() {
    import_termx_markup.Output.print(import_termx_markup.html` <span color="green">Initializing new project.</span> `);
    const projectDir = process.cwd();
    const entryFileContent = (0, import_entry_file.getEntryFile)();
    const configFileContent = (0, import_config_file.getProjectConfigFile)();
    const entryFilePath = import_path.default.resolve(projectDir, "src", "start.tsx");
    const configFilePath = import_path.default.resolve(projectDir, "react-gnome.config.mjs");
    const srcDir = import_path.default.resolve(projectDir, "src");
    if (!import_fs.default.existsSync(srcDir)) {
      import_fs.default.mkdirSync(srcDir);
    }
    import_termx_markup.Output.print(
      import_termx_markup.html`<span
        >Creating entrypoint file:<s />
        <span color="white">
          ./${import_path.default.relative(projectDir, entryFilePath)}
        </span>
      </span>`
    );
    import_fs.default.writeFileSync(entryFilePath, entryFileContent);
    import_termx_markup.Output.print(
      import_termx_markup.html`<span>
        Creating config file:<s />
        <span color="white">
          ./${import_path.default.relative(projectDir, configFilePath)}
        </span>
      </span>`
    );
    import_fs.default.writeFileSync(configFilePath, configFileContent);
    import_termx_markup.Output.print(
      import_termx_markup.html`<span>
        Updating scripts in:<s /><span color="white">./package.json</span></span
      >`
    );
    const packageJsonPath = import_path.default.resolve(projectDir, "package.json");
    let packageJson = {};
    if (import_fs.default.existsSync(packageJsonPath)) {
      packageJson = JSON.parse(import_fs.default.readFileSync(packageJsonPath, "utf-8"));
    }
    const scripts = packageJson.scripts ?? {};
    const pmRun = this.packageManager.value === "npm" ? "npm run" : "yarn";
    scripts.build = `${pmRun} react-gnome build`;
    scripts.bundle = `${pmRun} react-gnome bundle`;
    scripts.start = `${pmRun} react-gnome start -m development -w`;
    scripts["install-pkg"] = "meson install -C ./dist/.build/_build";
    packageJson.type = "module";
    packageJson.scripts = scripts;
    import_fs.default.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
    import_termx_markup.Output.print(import_termx_markup.html` <span color="green">Done.</span> `);
  }
};
