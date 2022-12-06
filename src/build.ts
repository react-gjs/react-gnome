import type { ValidationError } from "dilswer/dist/types/validation-algorithms/validation-error/validation-error";
import esbuild from "esbuild";
import fs from "fs";
import path from "path";
import { parseConfig } from "./config/parse-config";
import { reactGtkPlugin } from "./esbuild-plugin/react-gtk-plugin";
export type { Config } from "./config/config-schema";

const isObject = (o: unknown): o is object =>
  typeof o === "object" && o != null;

const isValidationError = (e: unknown): e is ValidationError => {
  return (isObject(e) && e instanceof Error && "fieldPath" in e) || false;
};

const watch = process.argv.includes("--watch") || process.argv.includes("-w");

export async function build() {
  try {
    const cwd = process.cwd();
    const cwdFiles = fs.readdirSync(cwd);

    const filename = cwdFiles.find((f) => f.startsWith("react-gtk.config."));

    if (!filename) {
      throw new Error("No config file found.");
    }

    const config = await parseConfig(path.join(cwd, filename));

    await esbuild.build({
      target: "es6",
      format: "esm",
      entryPoints: [path.resolve(cwd, config.entrypoint)],
      outfile: path.resolve(cwd, config.outDir, "index.js"),
      plugins: [reactGtkPlugin(config), ...(config.esbuildPlugins ?? [])],
      external: config.externalPackages,
      minify: config.minify,
      jsx: "transform",
      keepNames: true,
      bundle: true,
      watch,
    });
  } catch (e) {
    if (isValidationError(e)) {
      console.error(
        `Config file is invalid. Property "${e.fieldPath}" is incorrect.`
      );
    } else if (isObject(e) && e instanceof Error) {
      console.error("Build failed due to an error: ", e.message);
    } else {
      console.error("Build failed due to an unknown error.");
    }
    process.exit(1);
  }
}
