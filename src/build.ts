import esbuild from "esbuild";
import fs from "fs";
import path from "path";
import { parseConfig } from "./config/parse-config";
import { reactGtkPlugin } from "./esbuild-plugin/react-gtk-plugin";

const watch = process.argv.includes("--watch") || process.argv.includes("-w");

export async function build() {
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
    plugins: [reactGtkPlugin()],
    external: config.externalPackages,
    minify: config.minify,
    jsx: "transform",
    bundle: true,
    watch,
  });
}
