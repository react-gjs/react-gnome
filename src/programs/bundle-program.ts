import path from "path";
import { html, Output } from "termx-markup";
import { getPlugins } from "../utils/get-plugins";
import { getGlobalPolyfills } from "../utils/get-polyfills";
import { Program } from "./base";
import { defaultBuildOptions } from "./default-build-options";

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

    const polyfills = getGlobalPolyfills(this);

    await this.esbuildCtx.init(
      {
        ...defaultBuildOptions,
        inject: polyfills.inject,
        banner: { js: polyfills.banner.join("\n\n") },
        entryPoints: [path.resolve(this.cwd, this.config.entrypoint)],
        outfile: path.resolve(this.cwd, this.config.outDir, "index.js"),
        plugins: getPlugins(this),
        minify: this.config.minify ?? (this.isDev ? false : true),
        treeShaking: this.config.treeShake ?? (this.isDev ? false : true),
      },
      this.watchMode,
    );

    await this.esbuildCtx.start();

    if (!this.watchMode) {
      Output.print(html` <span color="lightGreen">Build completed.</span> `);
    }
  }
}
