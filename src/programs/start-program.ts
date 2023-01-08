import chalk from "chalk";
import esbuild from "esbuild";
import { existsSync } from "fs";
import path from "path";
import rimraf from "rimraf";
import { startAppPlugin } from "../esbuild-plugins/start-app/start-app-plugin";
import { AppResources } from "../utils/app-resources";
import { Command } from "../utils/command";
import { getPlugins } from "../utils/get-plugins";
import { getPolyfills } from "../utils/get-polyfills";
import { PackageProgram } from "./package-program";

export class StartProgram extends PackageProgram {
  protected getBuildDirPath() {
    return path.resolve(this.cwd, this.config.outDir, ".build");
  }

  additionalPlugins() {
    return {
      before: [
        startAppPlugin({
          getCwd: () => this.getBuildDirPath(),
          beforeStart: this.beforeStart.bind(this),
        }),
      ],
    };
  }

  protected async beforeStart() {
    const appName = this.appName;
    const buildDirPath = this.getBuildDirPath();

    await this.prepareBuildFiles(appName, buildDirPath);

    await new Command("meson", ["setup", "_build"], {
      cwd: buildDirPath,
    }).run();
  }

  /** @internal */
  async main() {
    if (this.watchMode) {
      console.log(chalk.blueBright("Starting in watch mode."));
    } else {
      console.log(chalk.blueBright("Starting."));
    }

    const appName = this.config.applicationName.replace(/[^\w\d]/g, "");
    const buildDirPath = this.getBuildDirPath();

    this.resources = new AppResources(appName);

    if (existsSync(buildDirPath))
      await new Promise<void>((resolve, reject) => {
        rimraf(buildDirPath, {}, (e) => {
          if (e) reject(e);
          else resolve();
        });
      });

    await esbuild.build({
      target: "es6",
      format: "esm",
      inject: getPolyfills(this),
      entryPoints: [path.resolve(this.cwd, this.config.entrypoint)],
      outfile: path.resolve(buildDirPath, "src", "main.js"),
      plugins: getPlugins(this),
      external: this.config.externalPackages,
      minify: this.config.minify ?? (this.isDev ? false : true),
      treeShaking: this.config.treeShake ?? (this.isDev ? false : true),
      jsx: "transform",
      keepNames: true,
      bundle: true,
      watch: this.watchMode,
    });
  }
}
