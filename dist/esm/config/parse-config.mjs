// src/config/parse-config.ts
import { assertDataType } from "dilswer";
import fs from "fs/promises";
import path from "path";
import { ConfigSchema } from "./config-schema.mjs";
import { evalJsConfigFile } from "./eval-js-config/eval-js-config.mjs";
async function parseJsonConfig(filePath) {
  const fileData = await fs.readFile(filePath, "utf-8");
  const config = JSON.parse(fileData);
  assertDataType(ConfigSchema, config);
  return config;
}
async function parseJsConfig(filePath, context) {
  const getConfig = await evalJsConfigFile(filePath);
  const config = getConfig(context);
  assertDataType(ConfigSchema, config);
  return config;
}
function parseConfig(filePath, context) {
  const p = path.parse(filePath);
  if (p.ext === ".json") {
    return parseJsonConfig(filePath);
  } else if ([".js", ".cjs", ".mjs", ".ts", ".cts", ".mts"].includes(p.ext)) {
    return parseJsConfig(filePath, context);
  } else {
    throw new Error(`Unsupported config file type: '${p.ext}'.`);
  }
}
export {
  parseConfig
};
