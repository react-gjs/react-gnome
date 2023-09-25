var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};

// src/programs/base.ts
import { Argument } from "clify.js";
import { EnvVars } from "../utils/env-vars.mjs";
import { ESBuild } from "../utils/esbuild.mjs";
import { handleProgramError } from "../utils/handle-program-error.mjs";
import { parseEnvVarConfig } from "../utils/parse-env-var-config.mjs";
import { readConfig } from "../utils/read-config.mjs";
import { validateAppName } from "../utils/validate-app-name.mjs";
import { validatePrefix } from "../utils/validate-prefix.mjs";
var WatchArgument = Argument.define({
  flagChar: "-w",
  keyword: "--watch",
  dataType: "boolean"
});
var BuildModeArgument = Argument.define({
  flagChar: "-m",
  keyword: "--mode",
  dataType: "string",
  description: "The build mode, either 'development' or 'production'."
});
var Program = class {
  constructor() {
    __publicField(this, "type", "build");
    __publicField(this, "envs", new EnvVars());
    __publicField(this, "config");
    __publicField(this, "cwd", process.cwd());
    __publicField(this, "resources");
    __publicField(this, "esbuildCtx", new ESBuild());
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
    return validateAppName(
      this.config.applicationName.replace(/[^\w\d_-]/g, "")
    );
  }
  get appID() {
    if (this.config.applicationPrefix) {
      const prefix = this.config.applicationPrefix.trim().replace(/(^\.+)|(\.+$)/g, "");
      validatePrefix(prefix);
      return `${prefix}.${this.config.applicationName}`;
    }
    return `org.gnome.${this.config.applicationName}`;
  }
  populateDefaultEnvVars() {
    parseEnvVarConfig(this);
    this.envs.define(
      "friendlyAppName",
      this.config.friendlyName ?? this.config.applicationName
    );
    this.envs.define("appName", this.appName);
    this.envs.define("appVersion", this.config.applicationVersion);
    this.envs.define("appId", this.appID);
    this.envs.define("mode", this.isDev ? "development" : "production");
  }
  /**
   * @internal
   */
  async run() {
    try {
      this.config = await readConfig(this);
      this.populateDefaultEnvVars();
      return await this.main(this);
    } catch (e) {
      handleProgramError(e);
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
      handleProgramError(e);
    } finally {
      if (!this.esbuildCtx.isWatching) {
        await this.esbuildCtx.dispose();
      }
    }
  }
};
export {
  Program
};
