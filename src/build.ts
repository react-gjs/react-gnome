import chalk from "chalk";
import { Argument, configure } from "clify.js";
import esbuild from "esbuild";
import path from "path";
import type { Config } from "./config/config-schema";
import { startAppPlugin } from "./esbuild-plugins/start-app/start-app-plugin";
import { getPlugins } from "./utils/get-plugins";
import { getPolyfills } from "./utils/get-polyfills";
import { handleProgramError } from "./utils/handle-program-error";
import { readConfig } from "./utils/read-config";

const WatchArgument = Argument.define({
  flagChar: "-w",
  keyword: "--watch",
  dataType: "boolean",
});

const BuildModeArgument = Argument.define({
  flagChar: "-m",
  keyword: "--mode",
  dataType: "string",
  description: "The build mode, either 'development' or 'production'.",
});

export abstract class Program {
  readonly config!: Config;
  readonly cwd = process.cwd();

  readonly args = {
    watch: new WatchArgument(),
    mode: new BuildModeArgument(),
  };

  get isDev() {
    return this.args.mode.value === "development";
  }

  get watchMode() {
    return this.args.watch.value || false;
  }

  abstract additionalPlugins(): {
    before?: esbuild.Plugin[];
    after?: esbuild.Plugin[];
  };

  abstract main<T extends this>(program: T): any;

  async run() {
    try {
      // @ts-expect-error
      this.config = await readConfig(this);
      return await this.main(this);
    } catch (e) {
      handleProgramError(e);
    }
  }
}

class BuildProgram extends Program {
  additionalPlugins() {
    return {};
  }

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
      external: this.config.externalPackages,
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
class StartProgram extends Program {
  additionalPlugins() {
    return {
      before: [startAppPlugin(path.resolve(this.cwd, this.config.outDir))],
    };
  }

  async main() {
    if (this.watchMode) {
      console.log(chalk.blueBright("Starting in watch mode."));
    } else {
      console.log(chalk.blueBright("Starting."));
    }

    await esbuild.build({
      target: "es6",
      format: "esm",
      inject: getPolyfills(this),
      entryPoints: [path.resolve(this.cwd, this.config.entrypoint)],
      outfile: path.resolve(this.cwd, this.config.outDir, "index.js"),
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

export async function build() {
  configure((main) => {
    main.setDisplayName("react-gnome");
    main.setDescription("Build GTK apps with React.");

    const buildCommand = main.addSubCommand("build", () => new BuildProgram());
    const startCommand = main.addSubCommand("start", () => new StartProgram());

    buildCommand.setDescription("Build and bundle the app into a single file.");
    startCommand.setDescription("Build, bundle and open the app.");
  });
}
