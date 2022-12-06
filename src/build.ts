import { Argument, configure } from "clify.js";
import type { ValidationError } from "dilswer/dist/types/validation-algorithms/validation-error/validation-error";
import esbuild from "esbuild";
import fs from "fs";
import path from "path";
import { parseConfig } from "./config/parse-config";
import { reactGtkPlugin } from "./react-gtk-esbuild-plugin/react-gtk-plugin";
import { startAppPlugin } from "./start-app-esbuild-plugin/start-app-plugin";

const isObject = (o: unknown): o is object =>
  typeof o === "object" && o != null;

const isValidationError = (e: unknown): e is ValidationError => {
  return (isObject(e) && e instanceof Error && "fieldPath" in e) || false;
};

const WatchArgument = Argument.define({
  flagChar: "-w",
  keyword: "--watch",
  dataType: "boolean",
});

export async function build() {
  configure((main) => {
    main.setDisplayName("react-gtk");
    main.setDescription("Build GTK apps with React.");

    main.addSubCommand("build", () => {
      const watch = new WatchArgument();

      return {
        commandDescription: "Build and bundle the app into a single file.",
        async run() {
          try {
            const cwd = process.cwd();
            const cwdFiles = fs.readdirSync(cwd);

            const filename = cwdFiles.find((f) =>
              f.startsWith("react-gtk.config.")
            );

            if (!filename) {
              throw new Error("No config file found.");
            }

            const config = await parseConfig(path.join(cwd, filename));

            await esbuild.build({
              target: "es6",
              format: "esm",
              entryPoints: [path.resolve(cwd, config.entrypoint)],
              outfile: path.resolve(cwd, config.outDir, "index.js"),
              plugins: [
                reactGtkPlugin(config),
                ...(config.esbuildPlugins ?? []),
              ],
              external: config.externalPackages,
              minify: config.minify,
              treeShaking: config.treeShake,
              jsx: "transform",
              keepNames: true,
              bundle: true,
              watch: watch.value,
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
        },
      };
    });

    main.addSubCommand("start", () => {
      const watch = new WatchArgument();

      return {
        commandDescription: "Build, bundle and open the app.",
        async run() {
          try {
            const cwd = process.cwd();
            const cwdFiles = fs.readdirSync(cwd);

            const filename = cwdFiles.find((f) =>
              f.startsWith("react-gtk.config.")
            );

            if (!filename) {
              throw new Error("No config file found.");
            }

            const config = await parseConfig(path.join(cwd, filename));

            await esbuild.build({
              target: "es6",
              format: "esm",
              entryPoints: [path.resolve(cwd, config.entrypoint)],
              outfile: path.resolve(cwd, config.outDir, "index.js"),
              plugins: [
                reactGtkPlugin(config),
                startAppPlugin(path.resolve(cwd, config.outDir)),
                ...(config.esbuildPlugins ?? []),
              ],
              external: config.externalPackages,
              minify: config.minify,
              treeShaking: config.treeShake,
              jsx: "transform",
              keepNames: true,
              bundle: true,
              watch: watch.value,
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
        },
      };
    });
  });
}
