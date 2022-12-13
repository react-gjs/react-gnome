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

type MapArgRecord<A extends Record<string, Argument<any, any>>> = {
  [K in keyof A]: A[K]["value"];
};

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

abstract class Program {
  config!: Readonly<Config>;
  cwd = process.cwd();

  readonly args = {
    watch: new WatchArgument(),
    mode: new BuildModeArgument(),
  } as const;

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

  /** @internal */
  abstract main<T extends this>(program: T): any;

  /** @internal */
  async run() {
    try {
      this.config = await readConfig(this);
      return await this.main(this);
    } catch (e) {
      handleProgramError(e);
    }
  }

  async runWith(
    args: MapArgRecord<this["args"]>,
    config: Config,
    workingDir?: string
  ) {
    try {
      if (workingDir) {
        this.cwd = workingDir;
      }
      this.config = config;
      for (const [key, value] of Object.entries(args)) {
        // @ts-ignore
        const arg: Argument<any, any> = this.args[key];
        if (arg) {
          arg.setDefault(value);
        }
      }

      // Freeze the config and args to prevent accidental modification during
      // the execution of the program.
      Object.freeze(this);
      Object.freeze(this.args);
      Object.freeze(this.config);

      return await this.main(this);
    } catch (e) {
      handleProgramError(e);
    }
  }
}

export type { Program };

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
export class StartProgram extends Program {
  additionalPlugins() {
    return {
      before: [startAppPlugin(path.resolve(this.cwd, this.config.outDir))],
    };
  }

  /** @internal */
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

/** Invokes the CLI program that builds the app. */
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
