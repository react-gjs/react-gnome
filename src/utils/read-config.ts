import fs from "fs";
import path from "path";
import type { Program } from "../build";
import { parseConfig } from "../config/parse-config";

export const readConfig = async (program: Program) => {
  const cwdFiles = fs.readdirSync(program.cwd);

  const filename = cwdFiles.find((f) => f.startsWith("react-gnome.config."));

  if (!filename) {
    throw new Error("No config file found.");
  }

  const config = await parseConfig(path.join(program.cwd, filename), {
    mode: program.isDev ? "development" : "production",
  });

  return config;
};
