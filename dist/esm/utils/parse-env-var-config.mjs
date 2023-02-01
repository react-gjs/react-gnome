// src/utils/parse-env-var-config.ts
import fs from "fs";
import path from "path";
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
  const cwdFiles = fs.readdirSync(program.cwd);
  const envFileName = envVars?.envFilePath ?? ".env";
  const failIfNoEnvFile = envVars?.envFilePath !== void 0;
  if (cwdFiles.includes(envFileName)) {
    const envFileData = fs.readFileSync(
      path.resolve(program.cwd, envFileName),
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
export {
  parseEnvVarConfig
};
