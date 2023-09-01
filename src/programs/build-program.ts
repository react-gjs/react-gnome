import { existsSync, readdirSync } from "fs";
import fs from "fs/promises";
import path from "path";
import rimraf from "rimraf";
import tar from "tar";
import { html, Output } from "termx-markup";
import { getAppData } from "../packaging/templates/data/appdata";
import { getDataBusname } from "../packaging/templates/data/busname";
import { getDataDesktopEntry } from "../packaging/templates/data/desktop-entry";
import { getDataGSchema } from "../packaging/templates/data/gschema";
import { getDataResources } from "../packaging/templates/data/resources";
import { getDataService } from "../packaging/templates/data/service";
import { getGResourceXml } from "../packaging/templates/gresource";
import { getInFile } from "../packaging/templates/in-file";
import { getDataMesonBuild } from "../packaging/templates/meson/data";
import { getMainMesonBuild } from "../packaging/templates/meson/main";
import { getPoMesonBuild } from "../packaging/templates/meson/po";
import { getSrcMesonBuild } from "../packaging/templates/meson/src";
import { getPackageJson } from "../packaging/templates/package-json";
import { getPoFiles } from "../packaging/templates/po/get-po-files";
import { getLinguas } from "../packaging/templates/po/linguas";
import { getPostInstallScript } from "../packaging/templates/post-install-script";
import { AppResources } from "../utils/app-resources";
import { Command } from "../utils/command";
import { getPlugins } from "../utils/get-plugins";
import { getGlobalPolyfills } from "../utils/get-polyfills";
import { pascalToKebab } from "../utils/pascal-to-kebab";
import { Program } from "./base";
import { createBuildOptions } from "./default-build-options";

type PackagingContext = {
  appID: string;
  appName: string;
  appVersion: string;
  packageName: string;
};

export class BuildProgram extends Program {
  readonly type: "build" | "bundle" | "init" | "start" = "build";

  additionalPlugins() {
    return {};
  }

  protected async write(data: string, ...pathParts: string[]) {
    await fs.writeFile(path.resolve(...pathParts), data, "utf-8");
  }

  protected async createDataDir(buildDirPath: string) {
    const dataDirPath = path.resolve(buildDirPath, "data");

    try {
      await fs.mkdir(dataDirPath, { recursive: true });
    } catch (e) {
      //
    }
  }

  protected async createMesonDir(buildDirPath: string) {
    const mesonDirPath = path.resolve(buildDirPath, "meson");

    try {
      await fs.mkdir(mesonDirPath, { recursive: true });
    } catch (e) {
      //
    }
  }

  protected async createPoDir(buildDirPath: string) {
    const poDirPath = path.resolve(buildDirPath, "po");

    try {
      await fs.mkdir(poDirPath, { recursive: true });
    } catch (e) {
      //
    }
  }

  protected async preparePoDirFiles(
    poDirPath: string,
    context: PackagingContext,
  ) {
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

  protected async prepareMesonDirFiles(
    mesonDirPath: string,
    context: PackagingContext,
  ) {
    const postInstallScript = getPostInstallScript({
      packageName: context.packageName,
    });

    await this.write(postInstallScript, mesonDirPath, "meson_post_install.py");
  }

  protected async prepareDataDirFiles(
    dataDirPath: string,
    context: PackagingContext,
  ) {
    const appData = getAppData({
      appID: context.appID,
      license: this.config.license ?? "GPL2",
      friendlyName: this.config.friendlyName ?? this.config.applicationName,
    });
    const dataBusname = getDataBusname({
      appID: context.appID,
    });
    const dataDesktopEntry = getDataDesktopEntry({
      appID: context.appID,
      friendlyName: this.config.friendlyName ?? this.config.applicationName,
    });
    const gschema = getDataGSchema({
      appID: context.appID,
    });
    const resources = getDataResources({
      appID: context.appID,
      files: this.resources?.getAll().map((r) => r.name),
    });
    const dataService = getDataService();
    const mesonBuild = getDataMesonBuild();

    await this.write(appData, dataDirPath, `${context.appID}.appdata.xml.in`);
    await this.write(dataBusname, dataDirPath, `${context.appID}.busname`);
    await this.write(
      dataDesktopEntry,
      dataDirPath,
      `${context.appID}.desktop.in`,
    );
    await this.write(gschema, dataDirPath, `${context.appID}.gschema.xml`);
    await this.write(
      resources,
      dataDirPath,
      `${context.appID}.data.gresource.xml`,
    );
    await this.write(dataService, dataDirPath, `${context.appID}.service.in`);
    await this.write(mesonBuild, dataDirPath, "meson.build");

    for (const resource of this.resources?.getAll() || []) {
      await fs.copyFile(
        resource.fullPath,
        path.resolve(dataDirPath, resource.name),
      );
    }
  }

  protected async prepareSrcDirFiles(
    srcDirPath: string,
    context: PackagingContext,
  ) {
    const inFile = getInFile({
      appID: context.appID,
    });

    const gresource = getGResourceXml({
      appID: context.appID,
    });

    const srcMesonBuild = getSrcMesonBuild();

    const inFilePath = path.resolve(srcDirPath, `${context.appID}.in`);

    await this.write(inFile, inFilePath);
    await this.write(
      gresource,
      srcDirPath,
      `${context.appID}.src.gresource.xml.in`,
    );
    await this.write(srcMesonBuild, srcDirPath, "meson.build");

    await fs.chmod(inFilePath, "0775");
  }

  protected async prepareMainBuildDirFiles(
    buildDirPath: string,
    context: PackagingContext,
  ) {
    const mainMesonBuild = getMainMesonBuild({
      appID: context.appID,
      packageName: context.packageName,
      packageVersion: context.appVersion,
      license: this.config.license ?? "GPL2",
    });

    const packageJson = getPackageJson({
      appID: context.appID,
      packageName: context.packageName,
    });

    await this.write(mainMesonBuild, buildDirPath, "meson.build");
    await this.write(packageJson, buildDirPath, `${context.appID}.json`);
  }

  protected async prepareBuildFiles(appName: string, buildDirPath: string) {
    const context: PackagingContext = {
      appName,
      appVersion: this.config.applicationVersion,
      appID: this.appID,
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
      context,
    );
    await this.preparePoDirFiles(path.resolve(buildDirPath, "po"), context);

    return context;
  }

  /**
   * @internal
   */
  async main() {
    Output.print(html` <span color="lightBlue">Building package...</span> `);

    const appName = this.appName;
    const buildDirPath = path.resolve(this.cwd, this.config.outDir, ".build");

    this.resources = new AppResources(this.appID);

    if (existsSync(buildDirPath)) await rimraf(buildDirPath, {});

    const polyfills = await getGlobalPolyfills(this);

    await this.esbuildCtx.init(
      createBuildOptions({
        banner: { js: polyfills.bundle },
        entryPoints: [path.resolve(this.cwd, this.config.entrypoint)],
        outfile: path.resolve(buildDirPath, "src", "main.js"),
        plugins: getPlugins(this, { giRequirements: polyfills.requirements }),
        minify: this.config.minify ?? (this.isDev ? false : true),
        treeShaking: this.config.treeShake ?? (this.isDev ? false : true),
      }),
    );

    await this.esbuildCtx.start();

    const { packageName, appVersion } = await this.prepareBuildFiles(
      appName,
      buildDirPath,
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
            `${packageName}-${appVersion}.tar.gz`,
          ),
          prefix: packageName,
        },
        readdirSync(buildDirPath),
        (e) => (e ? reject(e) : resolve()),
      );
    });

    Output.print(html`<span color="lightGreen">Package created.</span>`);
  }
}
