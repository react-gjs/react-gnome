"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
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
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/utils/parse-env-var-config.ts
var parse_env_var_config_exports = {};
__export(parse_env_var_config_exports, {
  parseEnvVarConfig: () => parseEnvVarConfig
});
module.exports = __toCommonJS(parse_env_var_config_exports);
var import_fs = __toESM(require("fs"));
var import_path = __toESM(require("path"));
var isAllowed = (allowed, key) => {
  if (allowed === void 0) {
    return true;
  }
  if (Array.isArray(allowed)) {
    return allowed.includes(key);
  }
  return key.match(allowed);
};
var isDisallowed = (disallowed, key) => {
  if (disallowed === void 0) {
    return false;
  }
  if (Array.isArray(disallowed)) {
    return disallowed.includes(key);
  }
  return key.match(disallowed);
};
var parseEnvVarValue = (value) => {
  if (value === void 0) {
    return void 0;
  }
  if (value === "true") {
    return true;
  }
  if (value === "false") {
    return false;
  }
  if (value.match(/^\d+$/)) {
    return Number(value);
  }
  if (value.match(/^".*"$/)) {
    return value.slice(1, -1);
  }
  return value;
};
var parseDotEnv = (data) => {
  const lines = data.split("\n");
  const vars = [];
  for (const line of lines) {
    if (line.startsWith("#")) {
      continue;
    }
    if (line.match(/^[\w\d_$]+=.*/)) {
      const [key, value] = line.trim().split("=");
      vars.push([key, parseEnvVarValue(value)]);
    }
  }
  return vars;
};
var parseEnvVarConfig = (program) => {
  const { envVars } = program.config;
  const vars = [];
  for (const [key, value] of Object.entries(envVars?.defaults ?? {})) {
    vars.push([key, value]);
  }
  if (envVars?.systemVars) {
    const allSystemVars = Object.entries(process.env);
    for (const [key, value] of allSystemVars) {
      if (vars.some(([k]) => k === key)) {
        continue;
      }
      if (isAllowed(envVars.allow, key) && !isDisallowed(envVars.disallow, key)) {
        vars.push([key, value]);
      }
    }
  }
  const cwdFiles = import_fs.default.readdirSync(program.cwd);
  const envFileName = envVars?.envFilePath ?? ".env";
  const failIfNoEnvFile = envVars?.envFilePath !== void 0;
  if (cwdFiles.includes(envFileName)) {
    const envFileData = import_fs.default.readFileSync(
      import_path.default.resolve(program.cwd, envFileName),
      "utf-8"
    );
    for (const envVarEntry of parseDotEnv(envFileData)) {
      if (vars.some(([k]) => k === envVarEntry[0])) {
        continue;
      }
      vars.push(envVarEntry);
    }
  } else if (failIfNoEnvFile) {
    throw new Error(`No env file found at '${envFileName}'.`);
  }
  for (const [key, value] of vars) {
    program.envs.define(key, value);
  }
};
