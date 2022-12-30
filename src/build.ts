import chalk from "chalk";
import { Argument, configure } from "clify.js";
import esbuild from "esbuild";
import { existsSync, readdirSync } from "fs";
import fs from "fs/promises";
import path from "path";
import rimraf from "rimraf";
import tar from "tar";
import type { Config } from "./config/config-schema";
import { startAppPlugin } from "./esbuild-plugins/start-app/start-app-plugin";
import { getAppData } from "./packaging/templates/data/appdata";
import { getDataBusname } from "./packaging/templates/data/busname";
import { getDataDesktopEntry } from "./packaging/templates/data/desktop-entry";
import { getDataGSchema } from "./packaging/templates/data/gschema";
import { getDataResources } from "./packaging/templates/data/resources";
import { getDataService } from "./packaging/templates/data/service";
import { getGResourceXml } from "./packaging/templates/gresource";
import { getInFile } from "./packaging/templates/in-file";
import { getDataMesonBuild } from "./packaging/templates/meson/data";
import { getMainMesonBuild } from "./packaging/templates/meson/main";
import { getPoMesonBuild } from "./packaging/templates/meson/po";
import { getSrcMesonBuild } from "./packaging/templates/meson/src";
import { getPackageJson } from "./packaging/templates/package-json";
import { getPoFiles } from "./packaging/templates/po/get-po-files";
import { getLinguas } from "./packaging/templates/po/linguas";
import { getPostInstallScript } from "./packaging/templates/post-install-script";
import { Command } from "./utils/command";
import { getPlugins } from "./utils/get-plugins";
import { getPolyfills } from "./utils/get-polyfills";
import { handleProgramError } from "./utils/handle-program-error";
import { pascalToKebab } from "./utils/pascal-to-kebab";
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

type PackagingContext = {
  appID: string;
  appName: string;
  appVersion: string;
  packageName: string;
};

export class PackageProgram extends Program {
  additionalPlugins() {
    return {};
  }

  async write(data: string, ...pathParts: string[]) {
    await fs.writeFile(path.resolve(...pathParts), data, "utf-8");
  }

  async createDataDir(buildDirPath: string) {
    const dataDirPath = path.resolve(buildDirPath, "data");

    try {
      await fs.mkdir(dataDirPath, { recursive: true });
    } catch (e) {
      //
    }
  }

  async createMesonDir(buildDirPath: string) {
    const mesonDirPath = path.resolve(buildDirPath, "meson");

    try {
      await fs.mkdir(mesonDirPath, { recursive: true });
    } catch (e) {
      //
    }
  }

  async createPoDir(buildDirPath: string) {
    const poDirPath = path.resolve(buildDirPath, "po");

    try {
      await fs.mkdir(poDirPath, { recursive: true });
    } catch (e) {
      //
    }
  }

  async preparePoDirFiles(poDirPath: string, context: PackagingContext) {
    const linguas = getLinguas();
    const poFiles = getPoFiles({
      appName: context.appName,
    });
    const poMesonBuild = getPoMesonBuild();

    await this.write(linguas, poDirPath, "LINGUAS");

    for (const po of poFiles) {
      await this.write(po.content, poDirPath, `${po.language}.po`);
    }

    await this.write(poMesonBuild, poDirPath, "meson.build");
  }

  async prepareMesonDirFiles(mesonDirPath: string, context: PackagingContext) {
    const postInstallScript = getPostInstallScript({
      packageName: context.packageName,
    });

    await this.write(postInstallScript, mesonDirPath, "meson_post_install.py");
  }

  async prepareDataDirFiles(dataDirPath: string, context: PackagingContext) {
    const appData = getAppData({
      appID: context.appID,
      license: "GPL2", // TODO: Make this configurable
      friendlyName: context.appName, // TODO: Make this configurable
    });
    const dataBusname = getDataBusname({
      appID: context.appID,
    });
    const dataDesktopEntry = getDataDesktopEntry({
      appID: context.appID,
      friendlyName: context.appName, // TODO: Make this configurable
    });
    const gschema = getDataGSchema({
      appID: context.appID,
      appName: context.appName,
    });
    const resources = getDataResources({
      appName: context.appName,
    });
    const dataService = getDataService();
    const mesonBuild = getDataMesonBuild();

    await this.write(appData, dataDirPath, `${context.appID}.appdata.xml.in`);
    await this.write(dataBusname, dataDirPath, `${context.appID}.busname`);
    await this.write(
      dataDesktopEntry,
      dataDirPath,
      `${context.appID}.desktop.in`
    );
    await this.write(gschema, dataDirPath, `${context.appID}.gschema.xml`);
    await this.write(
      resources,
      dataDirPath,
      `${context.appID}.data.gresource.xml`
    );
    await this.write(dataService, dataDirPath, `${context.appID}.service.in`);
    await this.write(mesonBuild, dataDirPath, "meson.build");
  }

  async prepareSrcDirFiles(srcDirPath: string, context: PackagingContext) {
    const inFile = getInFile({
      appID: context.appID,
      appName: context.appName,
    });

    const gresource = getGResourceXml({
      appName: context.appName,
    });

    const srcMesonBuild = getSrcMesonBuild();

    const inFilePath = path.resolve(srcDirPath, `${context.appID}.in`);

    await this.write(inFile, inFilePath);
    await this.write(
      gresource,
      srcDirPath,
      `${context.appID}.src.gresource.xml.in`
    );
    await this.write(srcMesonBuild, srcDirPath, "meson.build");

    await fs.chmod(inFilePath, "0775");
  }

  async prepareMainBuildDirFiles(
    buildDirPath: string,
    context: PackagingContext
  ) {
    const mainMesonBuild = getMainMesonBuild({
      appID: context.appID,
      packageName: context.packageName,
      packageVersion: context.appVersion,
      license: "GPL2", // TODO: Make this configurable
    });

    const packageJson = getPackageJson({
      appID: context.appID,
      packageName: context.packageName,
    });

    await this.write(mainMesonBuild, buildDirPath, "meson.build");
    await this.write(packageJson, buildDirPath, `${context.appID}.json`);
  }

  async prepareBuildFiles(buildDirPath: string) {
    const appName = this.config.applicationName.replace(/[^\w\d]/g, "");

    const context: PackagingContext = {
      appName,
      appVersion: this.config.applicationVersion,
      appID: `org.gnome.${appName}`,
      packageName: `${pascalToKebab(appName)}`,
    };

    await this.createDataDir(buildDirPath);
    await this.createMesonDir(buildDirPath);
    await this.createPoDir(buildDirPath);

    await this.prepareMainBuildDirFiles(buildDirPath, context);
    await this.prepareSrcDirFiles(path.resolve(buildDirPath, "src"), context);
    await this.prepareDataDirFiles(path.resolve(buildDirPath, "data"), context);
    await this.prepareMesonDirFiles(
      path.resolve(buildDirPath, "meson"),
      context
    );
    await this.preparePoDirFiles(path.resolve(buildDirPath, "po"), context);

    return context;
  }

  /** @internal */
  async main() {
    console.log(chalk.blueBright("Building package..."));

    const buildDirPath = path.resolve(this.cwd, this.config.outDir, ".build");

    if (existsSync(buildDirPath))
      await new Promise<void>((resolve, reject) => {
        rimraf(buildDirPath, {}, (e) => {
          if (e) reject(e);
          else resolve();
        });
      });

    await esbuild.build({
      target: "es2020",
      format: "esm",
      inject: getPolyfills(this),
      entryPoints: [path.resolve(this.cwd, this.config.entrypoint)],
      outfile: path.resolve(buildDirPath, "src", "main.js"),
      plugins: getPlugins(this),
      external: this.config.externalPackages,
      minify: this.config.minify ?? (this.isDev ? false : true),
      treeShaking: this.config.treeShake ?? (this.isDev ? false : true),
      jsx: "transform",
      keepNames: true,
      bundle: true,
      watch: false,
    });

    const { packageName, appVersion } = await this.prepareBuildFiles(
      buildDirPath
    );

    await new Command("meson", ["setup", "_build"], {
      cwd: buildDirPath,
    }).run();
    await new Command("meson", ["compile", "--clean", "-C", "_build"], {
      cwd: buildDirPath,
    }).run();

    await new Promise<void>((resolve, reject) => {
      tar.create(
        {
          gzip: true,
          cwd: buildDirPath,
          file: path.resolve(
            this.cwd,
            this.config.outDir,
            `${packageName}-${appVersion}.tar.gz`
          ),
          prefix: packageName,
        },
        readdirSync(buildDirPath),
        (e) => (e ? reject(e) : resolve())
      );
    });

    console.log(chalk.greenBright("Package created."));
  }
}

/** Invokes the CLI program that builds the app. */
export async function build() {
  configure((main) => {
    main.setDisplayName("react-gnome");
    main.setDescription("Build GTK apps with React.");

    const buildCommand = main.addSubCommand("build", () => new BuildProgram());
    const startCommand = main.addSubCommand("start", () => new StartProgram());
    const packageCommand = main.addSubCommand(
      "create-package",
      () => new PackageProgram()
    );

    buildCommand.setDescription("Build and bundle the app into a single file.");
    startCommand.setDescription("Build, bundle and open the app.");
    packageCommand.setDescription(
      "Build, bundle and create a full package for the app."
    );
  });
}
