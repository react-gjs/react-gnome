// src/utils/read-config.ts
import fs from "fs";
import path from "path";
import { parseConfig } from "../config/parse-config.mjs";
var readConfig = async (program) => {
  const cwdFiles = fs.readdirSync(program.cwd);
  const filename = cwdFiles.find((f) => f.startsWith("react-gnome.config."));
  if (!filename) {
    throw new Error("No config file found.");
  }
  const config = await parseConfig(path.join(program.cwd, filename), {
    mode: program.isDev ? "development" : "production"
  });
  return config;
};
export {
  readConfig
};
