import path from "path";
import { html, Output } from "termx-markup";
import { getPlugins } from "../utils/get-plugins";
import { getGlobalPolyfills } from "../utils/get-polyfills";
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

    const polyfills = await getGlobalPolyfills(this);

    await this.esbuildCtx.init(
      createBuildOptions({
        banner: { js: polyfills.bundle },
        entryPoints: [path.resolve(this.cwd, this.config.entrypoint)],
        outfile: path.resolve(this.cwd, this.config.outDir, "index.js"),
        plugins: getPlugins(this, { giRequirements: polyfills.requirements }),
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
