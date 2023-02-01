// src/programs/start-program.ts
import { existsSync } from "fs";
import path from "path";
import rimraf from "rimraf";
import { html, Output } from "termx-markup";
import { startAppPlugin } from "../esbuild-plugins/start-app/start-app-plugin.mjs";
import { AppResources } from "../utils/app-resources.mjs";
import { Command } from "../utils/command.mjs";
import { getPlugins } from "../utils/get-plugins.mjs";
import { getPolyfills } from "../utils/get-polyfills.mjs";
import { BuildProgram } from "./build-program.mjs";
var StartProgram = class extends BuildProgram {
  getBuildDirPath() {
    return path.resolve(this.cwd, this.config.outDir, ".build");
  }
  additionalPlugins() {
    return {
      before: [
        startAppPlugin({
          getCwd: () => this.getBuildDirPath(),
          beforeStart: this.beforeStart.bind(this),
          program: this
        })
      ]
    };
  }
  async beforeStart() {
    const appName = this.appName;
    const buildDirPath = this.getBuildDirPath();
    await this.prepareBuildFiles(appName, buildDirPath);
    await new Command("meson", ["setup", "_build"], {
      cwd: buildDirPath
    }).run();
  }
  /** @internal */
  async main() {
    if (this.watchMode) {
      Output.print(
        html` <span color="lightBlue"> Starting in watch mode... </span> `
      );
    } else {
      Output.print(html` <span color="lightBlue"> Starting. </span> `);
    }
    const buildDirPath = this.getBuildDirPath();
    this.resources = new AppResources(this.appID);
    if (existsSync(buildDirPath))
      await rimraf(buildDirPath, {});
    await this.esbuildCtx.init(
      {
        target: "es6",
        format: "esm",
        inject: getPolyfills(this),
        entryPoints: [path.resolve(this.cwd, this.config.entrypoint)],
        outfile: path.resolve(buildDirPath, "src", "main.js"),
        plugins: getPlugins(this),
        minify: this.config.minify ?? (this.isDev ? false : true),
        treeShaking: this.config.treeShake ?? (this.isDev ? false : true),
        jsx: "transform",
        keepNames: true,
        bundle: true
      },
      this.watchMode
    );
    await this.esbuildCtx.start();
  }
};
export {
  StartProgram
};
