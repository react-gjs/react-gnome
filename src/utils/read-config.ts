import fs from "fs";
import path from "path";
import { parseConfig } from "../config/parse-config";
import type { Program } from "../programs/base";

export const readConfig = async (program: Program) => {
  const cwdFiles = fs.readdirSync(program.cwd);

  const filename = cwdFiles.find((f) => f.startsWith("react-gtk.config."));

  if (!filename) {
    throw new Error("No config file found.");
  }

  const config = await parseConfig(path.join(program.cwd, filename), {
    mode: program.isDev ? "development" : "production",
  });

  if (config.sourcemap == null) {
    config.sourcemap = true;
  }

  return config;
};
