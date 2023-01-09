import chalk from "chalk";
import esbuild from "esbuild";
import path from "path";
import { getPlugins } from "../utils/get-plugins";
import { getPolyfills } from "../utils/get-polyfills";
import { Program } from "./base";

export class BuildProgram extends Program {
  additionalPlugins() {
    return {};
  }

  /** @internal */
  async main() {
    if (this.watchMode) {
      console.log(chalk.blueBright("Building in watch mode..."));
    } else {
      console.log(chalk.blueBright("Building..."));
    }

    await esbuild.build({
      target: "es6",
      format: "esm",
      inject: getPolyfills(this),
      entryPoints: [path.resolve(this.cwd, this.config.entrypoint)],
      outfile: path.resolve(this.cwd, this.config.outDir, "index.js"),
      plugins: getPlugins(this),
      minify: this.config.minify ?? (this.isDev ? false : true),
      treeShaking: this.config.treeShake ?? (this.isDev ? false : true),
      jsx: "transform",
      keepNames: true,
      bundle: true,
      watch: this.watchMode,
    });

    if (!this.watchMode) {
      console.log(chalk.greenBright("Build completed."));
    }
  }
}
