import path from "path";
import type { Program } from "../build";
import { getDirPath } from "../get-dirpath/get-dirpath";

export const getPolyfills = (program: Program) => {
  const polyfills: string[] = [];

  const rootPath = getDirPath();

  if (program.config.polyfills?.fetch) {
    polyfills.push(path.resolve(rootPath, "polyfills/esm/fetch.mjs"));
  }

  if (program.config.polyfills?.base64) {
    polyfills.push(path.resolve(rootPath, "polyfills/esm/base64.mjs"));
  }

  return polyfills;
};
