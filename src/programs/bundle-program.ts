import path from "path";
import { html, Output } from "termx-markup";
import { getPlugins } from "../utils/get-plugins";
import { getGlobalPolyfills } from "../utils/get-polyfills";
import { Program } from "./base";

export class BundleProgram extends Program {
  additionalPlugins() {
    return {};
  }

  /** @internal */
  async main() {
    if (this.watchMode) {
      Output.print(
        html` <span color="lightBlue"> Building in watch mode... </span> `
      );
    } else {
      Output.print(html` <span color="lightBlue"> Building... </span> `);
    }

    await this.esbuildCtx.init(
      {
        target: "es6",
        format: "esm",
        inject: getGlobalPolyfills(this),
        entryPoints: [path.resolve(this.cwd, this.config.entrypoint)],
        outfile: path.resolve(this.cwd, this.config.outDir, "index.js"),
        plugins: getPlugins(this),
        minify: this.config.minify ?? (this.isDev ? false : true),
        treeShaking: this.config.treeShake ?? (this.isDev ? false : true),
        jsx: "transform",
        keepNames: true,
        bundle: true,
      },
      this.watchMode
    );

    await this.esbuildCtx.start();

    if (!this.watchMode) {
      Output.print(html` <span color="lightGreen">Build completed.</span> `);
    }
  }
}
