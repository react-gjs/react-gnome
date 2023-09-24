import fs from "fs";
import path from "path";
import type { Program } from "../programs/base";

type EnvVars = Array<[string, string | number | boolean | undefined]>;

const isAllowed = (allowed: string[] | RegExp | undefined, key: string) => {
  if (allowed === undefined) {
    return true;
  }

  if (Array.isArray(allowed)) {
    return allowed.includes(key);
  }

  return key.match(allowed);
};

const isDisallowed = (
  disallowed: string[] | RegExp | undefined,
  key: string,
) => {
  if (disallowed === undefined) {
    return false;
  }

  if (Array.isArray(disallowed)) {
    return disallowed.includes(key);
  }

  return key.match(disallowed);
};

const parseEnvVarValue = (value?: string) => {
  if (value === undefined) {
    return undefined;
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

const parseDotEnv = (data: string) => {
  const lines = data.split("\n");
  const vars: EnvVars = [];

  for (const line of lines) {
    if (line.startsWith("#")) {
      continue;
    }

    if (line.match(/^[\w\d_$]+=.*/)) {
      const [key, value] = line.trim().split("=");
      vars.push([key!, parseEnvVarValue(value)]);
    }
  }

  return vars;
};

export const parseEnvVarConfig = (program: Program) => {
  const { envVars } = program.config;

  const vars: EnvVars = [];

  // Add defaults defined in config
  for (const [key, value] of Object.entries(envVars?.defaults ?? {})) {
    vars.push([key, value]);
  }

  // Add system env vars
  if (envVars?.systemVars) {
    const allSystemVars = Object.entries(process.env);

    for (const [key, value] of allSystemVars) {
      if (vars.some(([k]) => k === key)) {
        continue;
      }

      if (
        isAllowed(envVars.allow, key) &&
        !isDisallowed(envVars.disallow, key)
      ) {
        vars.push([key, value]);
      }
    }
  }

  // Add env file vars
  const cwdFiles = fs.readdirSync(program.cwd);
  const envFileName = envVars?.envFilePath ?? ".env";
  const failIfNoEnvFile = envVars?.envFilePath !== undefined;

  if (cwdFiles.includes(envFileName)) {
    const envFileData = fs.readFileSync(
      path.resolve(program.cwd, envFileName),
      "utf-8",
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

  // Define the vars in the program to use in the build
  for (const [key, value] of vars) {
    program.envs.define(key, value);
  }
};
