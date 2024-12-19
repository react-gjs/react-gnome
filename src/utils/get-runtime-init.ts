import fs from "fs";
import path from "path";
import { getDirPath } from "../get-dirpath/get-dirpath";
import { Program } from "../programs/base";

const ALLOWED_EXTENSIONS = [".ts", ".js", ".mjs", ".cjs"];

export function getRuntimeInitImportPaths(program: Program) {
  const rootPath = getDirPath();
  const files = fs.readdirSync(path.join(rootPath, "runtime/esm"));
  const modules: string[] = [];
  for (const filename of files) {
    const ext = path.extname(filename);
    if (ALLOWED_EXTENSIONS.includes(ext)) {
      modules.push("@reactgjs/react-gtk/runtime/esm/" + filename);
    }
  }
  return modules;
}
