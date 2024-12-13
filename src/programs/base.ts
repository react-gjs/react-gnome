import { CommandInitPhase, defineOption, Option } from "clify.js";
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

export type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P];
};

const WatchOpt = defineOption({
  char: "w",
  name: "watch",
  type: "boolean",
});

const BuildModeOpt = defineOption({
  char: "m",
  name: "mode",
  type: "string",
  description: "The build mode, either 'development' or 'production'.",
  default: "production",
  required: true,
  validate(value) {
    if (value !== "development" && value !== "production") {
      return {
        message: "Invalid mode argument.",
        received: value,
        expected: "'development' or 'production'",
      };
    }
    return "ok";
  },
});

export abstract class Program {
  type: "build" | "bundle" | "init" | "start" = "build";
  envs = new EnvVars();
  config!: DeepReadonly<Config>;
  cwd = process.cwd();
  resources?: AppResources;
  esbuildCtx = new ESBuild();

  readonly args: {
    watch: Option<"boolean", false>;
    mode: Option<"string", true>;
  };

  constructor(init: CommandInitPhase) {
    this.args = {
      watch: init.option(WatchOpt),
      mode: init.option(BuildModeOpt),
    };
  }

  get isDev() {
    return this.args.mode.value === "development";
  }

  get watchMode() {
    return this.args.watch.value || false;
  }

  get appName() {
    return validateAppName(
      this.config.applicationName.replace(/[^\w\d_-]/g, ""),
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
      this.config.friendlyName ?? this.config.applicationName,
    );
    this.envs.define("appName", this.appName);
    this.envs.define("appVersion", this.config.applicationVersion);
    this.envs.define("appId", this.appID);
    this.envs.define("mode", this.isDev ? "development" : "production");
  }

  /** @internal */
  abstract main<T extends this>(program: T): any;

  protected afterBuild?(): void;

  /** @internal */
  async run() {
    try {
      this.config = await readConfig(this);
      this.populateDefaultEnvVars();
      const result = await this.main(this);
      if (this.afterBuild) {
        await this.afterBuild();
      }
      return result;
    } catch (e) {
      handleProgramError(e);
    } finally {
      if (!this.esbuildCtx.isWatching) {
        await this.esbuildCtx.dispose();
      }
    }
  }

  async runWith(
    args: {
      watch?: boolean;
      mode?: "development" | "production";
    },
    config: Config,
    workingDir?: string,
  ) {
    try {
      if (workingDir) {
        this.cwd = workingDir;
      }
      this.config = config;
      for (const [key, value] of Object.entries(args)) {
        // @ts-ignore
        const arg: Option<any, any> = this.args[key];
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
      if (!this.esbuildCtx.isWatching) {
        await this.esbuildCtx.dispose();
      }
    }
  }
}
