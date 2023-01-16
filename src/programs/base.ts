import { Argument } from "clify.js";
import type { Config } from "../config/config-type";
import type { AppResources } from "../utils/app-resources";
import { EnvVars } from "../utils/env-vars";
import { ESBuild } from "../utils/esbuild";
import type { AdditionalPlugins } from "../utils/get-plugins";
import { handleProgramError } from "../utils/handle-program-error";
import { parseEnvVarConfig } from "../utils/parse-env-var-config";
import { readConfig } from "../utils/read-config";
import { validateAppName } from "../utils/validate-app-name";
import { validatePrefix } from "../utils/validate-prefix";

type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object
    ? DeepReadonly<T[P]>
    : Readonly<T[P]>;
};

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

export abstract class Program {
  envs = new EnvVars();
  config!: DeepReadonly<Config>;
  cwd = process.cwd();
  resources?: AppResources;
  esbuildCtx = new ESBuild();

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

  get appName() {
    return validateAppName(
      this.config.applicationName.replace(/[^\w\d_-]/g, "")
    );
  }

  get appID() {
    if (this.config.applicationPrefix) {
      const prefix = this.config.applicationPrefix
        .trim()
        .replace(/(^\.+)|(\.+$)/g, "");
      validatePrefix(prefix);
      return `${prefix}.${this.config.applicationName}`;
    }
    return `org.gnome.${this.config.applicationName}`;
  }

  abstract additionalPlugins(): AdditionalPlugins;

  private populateDefaultEnvVars() {
    parseEnvVarConfig(this);

    this.envs.define(
      "friendlyAppName",
      this.config.friendlyName ?? this.config.applicationName
    );
    this.envs.define("appName", this.appName);
    this.envs.define("appVersion", this.config.applicationVersion);
    this.envs.define("appId", this.appID);
    this.envs.define("mode", this.isDev ? "development" : "production");
  }

  /** @internal */
  abstract main<T extends this>(program: T): any;

  /** @internal */
  async run() {
    try {
      this.config = await readConfig(this);
      this.populateDefaultEnvVars();
      return await this.main(this);
    } catch (e) {
      handleProgramError(e);
    } finally {
      if (this.esbuildCtx) {
        await this.esbuildCtx.dispose();
      }
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

      this.populateDefaultEnvVars();

      return await this.main(this);
    } catch (e) {
      handleProgramError(e);
    } finally {
      if (this.esbuildCtx) {
        await this.esbuildCtx.dispose();
      }
    }
  }
}
