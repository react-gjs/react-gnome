import path from "path";
import { Program } from "../programs/base";
import {
  getCustomPolyfillsImports,
  getGlobalPolyfillsInmportPaths,
} from "./get-polyfills";
import { getRuntimeInitImportPaths } from "./get-runtime-init";

export function getEntrypoint(program: Program) {
  const userEntrypointPath = path.resolve(
    program.cwd,
    program.config.entrypoint,
  );

  const lines: string[] = [];

  lines.push("// Runtime initialization");
  for (const initfile of getRuntimeInitImportPaths(program)) {
    lines.push(`import ${JSON.stringify(initfile)};`);
  }
  lines.push("");

  lines.push("// Register global polyfills");
  for (const polyfill of getGlobalPolyfillsInmportPaths(program)) {
    lines.push(`import ${JSON.stringify(polyfill)};`);
  }
  for (const customPolly of getCustomPolyfillsImports(program)) {
    lines.push(customPolly);
  }
  lines.push("");

  lines.push("// User entrypoint");
  lines.push(`import ${JSON.stringify(userEntrypointPath)};`);
  return lines.join("\n");
}
