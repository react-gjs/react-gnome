var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};

// src/programs/bundle-program.ts
import path from "path";
import { html, Output } from "termx-markup";
import { getPlugins } from "../utils/get-plugins.mjs";
import { getGlobalPolyfills } from "../utils/get-polyfills.mjs";
import { Program } from "./base.mjs";
import { createBuildOptions } from "./default-build-options.mjs";
var BundleProgram = class extends Program {
  constructor() {
    super(...arguments);
    __publicField(this, "type", "bundle");
  }
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
        treeShaking: this.config.treeShake ?? (this.isDev ? false : true)
      }),
      this.watchMode
    );
    await this.esbuildCtx.start();
    if (!this.watchMode) {
      Output.print(html` <span color="lightGreen">Build completed.</span> `);
    }
  }
};
export {
  BundleProgram
};
