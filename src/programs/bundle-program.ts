import path from "path";
import { html, Output } from "termx-markup";
import { getEntrypoint } from "../utils/get-entrypoint";
import { getPlugins } from "../utils/get-plugins";
import { Program } from "./base";
import { createBuildOptions } from "./default-build-options";

export class BundleProgram extends Program {
  readonly type = "bundle";

  additionalPlugins() {
    return {};
  }

  /**
   * @internal
   */
  async main() {
    if (this.watchMode) {
      Output.print(html`
        <span color="lightBlue"> Building in watch mode... </span>
      `);
    } else {
      Output.print(html` <span color="lightBlue"> Building... </span> `);
    }

    await this.esbuildCtx.init(
      createBuildOptions(this, {
        stdin: {
          contents: getEntrypoint(this),
          loader: "js",
          resolveDir: this.cwd,
        },
        outfile: path.resolve(this.cwd, this.config.outDir, "index.js"),
        plugins: getPlugins(this),
        minify: this.config.minify ?? (this.isDev ? false : true),
        treeShaking: this.config.treeShake ?? (this.isDev ? false : true),
      }),
      this.watchMode,
    );

    await this.esbuildCtx.start();

    if (!this.watchMode) {
      Output.print(html` <span color="lightGreen">Build completed.</span> `);
    }
  }
}
