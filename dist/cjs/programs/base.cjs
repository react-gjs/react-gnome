"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
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
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};

// src/programs/base.ts
var base_exports = {};
__export(base_exports, {
  Program: () => Program
});
module.exports = __toCommonJS(base_exports);
var import_clify = require("clify.js");
var import_env_vars = require("../utils/env-vars.cjs");
var import_esbuild = require("../utils/esbuild.cjs");
var import_handle_program_error = require("../utils/handle-program-error.cjs");
var import_parse_env_var_config = require("../utils/parse-env-var-config.cjs");
var import_read_config = require("../utils/read-config.cjs");
var import_validate_app_name = require("../utils/validate-app-name.cjs");
var import_validate_prefix = require("../utils/validate-prefix.cjs");
var WatchArgument = import_clify.Argument.define({
  flagChar: "-w",
  keyword: "--watch",
  dataType: "boolean"
});
var BuildModeArgument = import_clify.Argument.define({
  flagChar: "-m",
  keyword: "--mode",
  dataType: "string",
  description: "The build mode, either 'development' or 'production'."
});
var Program = class {
  constructor() {
    __publicField(this, "envs", new import_env_vars.EnvVars());
    __publicField(this, "config");
    __publicField(this, "cwd", process.cwd());
    __publicField(this, "resources");
    __publicField(this, "esbuildCtx", new import_esbuild.ESBuild());
    __publicField(this, "args", {
      watch: new WatchArgument(),
      mode: new BuildModeArgument()
    });
  }
  get isDev() {
    return this.args.mode.value === "development";
  }
  get watchMode() {
    return this.args.watch.value || false;
  }
  get appName() {
    return (0, import_validate_app_name.validateAppName)(
      this.config.applicationName.replace(/[^\w\d_-]/g, "")
    );
  }
  get appID() {
    if (this.config.applicationPrefix) {
      const prefix = this.config.applicationPrefix.trim().replace(/(^\.+)|(\.+$)/g, "");
      (0, import_validate_prefix.validatePrefix)(prefix);
      return `${prefix}.${this.config.applicationName}`;
    }
    return `org.gnome.${this.config.applicationName}`;
  }
  populateDefaultEnvVars() {
    (0, import_parse_env_var_config.parseEnvVarConfig)(this);
    this.envs.define(
      "friendlyAppName",
      this.config.friendlyName ?? this.config.applicationName
    );
    this.envs.define("appName", this.appName);
    this.envs.define("appVersion", this.config.applicationVersion);
    this.envs.define("appId", this.appID);
    this.envs.define("mode", this.isDev ? "development" : "production");
  }
  /** @internal */
  async run() {
    try {
      this.config = await (0, import_read_config.readConfig)(this);
      this.populateDefaultEnvVars();
      return await this.main(this);
    } catch (e) {
      (0, import_handle_program_error.handleProgramError)(e);
    } finally {
      if (!this.esbuildCtx.isWatching) {
        await this.esbuildCtx.dispose();
      }
    }
  }
  async runWith(args, config, workingDir) {
    try {
      if (workingDir) {
        this.cwd = workingDir;
      }
      this.config = config;
      for (const [key, value] of Object.entries(args)) {
        const arg = this.args[key];
        if (arg) {
          arg.setDefault(value);
        }
      }
      Object.freeze(this);
      Object.freeze(this.args);
      Object.freeze(this.config);
      this.populateDefaultEnvVars();
      return await this.main(this);
    } catch (e) {
      (0, import_handle_program_error.handleProgramError)(e);
    } finally {
      if (!this.esbuildCtx.isWatching) {
        await this.esbuildCtx.dispose();
      }
    }
  }
};
