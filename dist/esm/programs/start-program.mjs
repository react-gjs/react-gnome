var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};

// src/programs/start-program.ts
import { existsSync } from "fs";
import path from "path";
import rimraf from "rimraf";
import { html, Output } from "termx-markup";
import { startAppPlugin } from "../esbuild-plugins/start-app/start-app-plugin.mjs";
import { AppResources } from "../utils/app-resources.mjs";
import { Command } from "../utils/command.mjs";
import { getPlugins } from "../utils/get-plugins.mjs";
import { getGlobalPolyfills } from "../utils/get-polyfills.mjs";
import { BuildProgram } from "./build-program.mjs";
import { defaultBuildOptions } from "./default-build-options.mjs";
var StartProgram = class extends BuildProgram {
  constructor() {
    super(...arguments);
    __publicField(this, "type", "start");
  }
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
        ...defaultBuildOptions,
        inject: getGlobalPolyfills(this),
        entryPoints: [path.resolve(this.cwd, this.config.entrypoint)],
        outfile: path.resolve(buildDirPath, "src", "main.js"),
        plugins: getPlugins(this),
        minify: this.config.minify ?? (this.isDev ? false : true),
        treeShaking: this.config.treeShake ?? (this.isDev ? false : true)
      },
      this.watchMode
    );
    await this.esbuildCtx.start();
  }
};
export {
  StartProgram
};
