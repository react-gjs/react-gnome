"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if ((from && typeof from === "object") || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, {
          get: () => from[key],
          enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable,
        });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (
  (target = mod != null ? __create(__getProtoOf(mod)) : {}),
  __copyProps(
    isNodeMode || !mod || !mod.__esModule
      ? __defProp(target, "default", { value: mod, enumerable: true })
      : target,
    mod
  )
);
var __toCommonJS = (mod) =>
  __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/programs/package-program.ts
var package_program_exports = {};
__export(package_program_exports, {
  PackageProgram: () => PackageProgram,
});
module.exports = __toCommonJS(package_program_exports);
var import_chalk = __toESM(require("chalk"));
var import_esbuild = __toESM(require("esbuild"));
var import_fs = require("fs");
var import_promises = __toESM(require("fs/promises"));
var import_path = __toESM(require("path"));
var import_rimraf = __toESM(require("rimraf"));
var import_tar = __toESM(require("tar"));
var import_appdata = require("../packaging/templates/data/appdata.js");
var import_busname = require("../packaging/templates/data/busname.js");
var import_desktop_entry = require("../packaging/templates/data/desktop-entry.js");
var import_gschema = require("../packaging/templates/data/gschema.js");
var import_resources = require("../packaging/templates/data/resources.js");
var import_service = require("../packaging/templates/data/service.js");
var import_gresource = require("../packaging/templates/gresource.js");
var import_in_file = require("../packaging/templates/in-file.js");
var import_data = require("../packaging/templates/meson/data.js");
var import_main = require("../packaging/templates/meson/main.js");
var import_po = require("../packaging/templates/meson/po.js");
var import_src = require("../packaging/templates/meson/src.js");
var import_package_json = require("../packaging/templates/package-json.js");
var import_get_po_files = require("../packaging/templates/po/get-po-files.js");
var import_linguas = require("../packaging/templates/po/linguas.js");
var import_post_install_script = require("../packaging/templates/post-install-script.js");
var import_app_resources = require("../utils/app-resources.js");
var import_command = require("../utils/command.js");
var import_get_plugins = require("../utils/get-plugins.js");
var import_get_polyfills = require("../utils/get-polyfills.js");
var import_pascal_to_kebab = require("../utils/pascal-to-kebab.js");
var import_base = require("./base.js");
var PackageProgram = class extends import_base.Program {
  additionalPlugins() {
    return {};
  }
  async write(data, ...pathParts) {
    await import_promises.default.writeFile(
      import_path.default.resolve(...pathParts),
      data,
      "utf-8"
    );
  }
  async createDataDir(buildDirPath) {
    const dataDirPath = import_path.default.resolve(buildDirPath, "data");
    try {
      await import_promises.default.mkdir(dataDirPath, { recursive: true });
    } catch (e) {}
  }
  async createMesonDir(buildDirPath) {
    const mesonDirPath = import_path.default.resolve(buildDirPath, "meson");
    try {
      await import_promises.default.mkdir(mesonDirPath, { recursive: true });
    } catch (e) {}
  }
  async createPoDir(buildDirPath) {
    const poDirPath = import_path.default.resolve(buildDirPath, "po");
    try {
      await import_promises.default.mkdir(poDirPath, { recursive: true });
    } catch (e) {}
  }
  async preparePoDirFiles(poDirPath, context) {
    const linguas = (0, import_linguas.getLinguas)();
    const poFiles = (0, import_get_po_files.getPoFiles)({
      appName: context.appName,
    });
    const poMesonBuild = (0, import_po.getPoMesonBuild)();
    await this.write(linguas, poDirPath, "LINGUAS");
    for (const po of poFiles) {
      await this.write(po.content, poDirPath, `${po.language}.po`);
    }
    await this.write(poMesonBuild, poDirPath, "meson.build");
  }
  async prepareMesonDirFiles(mesonDirPath, context) {
    const postInstallScript = (0,
    import_post_install_script.getPostInstallScript)({
      packageName: context.packageName,
    });
    await this.write(postInstallScript, mesonDirPath, "meson_post_install.py");
  }
  async prepareDataDirFiles(dataDirPath, context) {
    const appData = (0, import_appdata.getAppData)({
      appID: context.appID,
      license: "GPL2",
      friendlyName: context.appName,
    });
    const dataBusname = (0, import_busname.getDataBusname)({
      appID: context.appID,
    });
    const dataDesktopEntry = (0, import_desktop_entry.getDataDesktopEntry)({
      appID: context.appID,
      friendlyName: context.appName,
    });
    const gschema = (0, import_gschema.getDataGSchema)({
      appID: context.appID,
      appName: context.appName,
    });
    const resources = (0, import_resources.getDataResources)({
      appName: context.appName,
      files: this.resources?.getAll().map((r) => r.name),
    });
    const dataService = (0, import_service.getDataService)();
    const mesonBuild = (0, import_data.getDataMesonBuild)();
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
    for (const resource of this.resources?.getAll() || []) {
      await import_promises.default.copyFile(
        resource.fullPath,
        import_path.default.resolve(dataDirPath, resource.name)
      );
    }
  }
  async prepareSrcDirFiles(srcDirPath, context) {
    const inFile = (0, import_in_file.getInFile)({
      appID: context.appID,
      appName: context.appName,
    });
    const gresource = (0, import_gresource.getGResourceXml)({
      appName: context.appName,
    });
    const srcMesonBuild = (0, import_src.getSrcMesonBuild)();
    const inFilePath = import_path.default.resolve(
      srcDirPath,
      `${context.appID}.in`
    );
    await this.write(inFile, inFilePath);
    await this.write(
      gresource,
      srcDirPath,
      `${context.appID}.src.gresource.xml.in`
    );
    await this.write(srcMesonBuild, srcDirPath, "meson.build");
    await import_promises.default.chmod(inFilePath, "0775");
  }
  async prepareMainBuildDirFiles(buildDirPath, context) {
    const mainMesonBuild = (0, import_main.getMainMesonBuild)({
      appID: context.appID,
      packageName: context.packageName,
      packageVersion: context.appVersion,
      license: "GPL2",
    });
    const packageJson = (0, import_package_json.getPackageJson)({
      appID: context.appID,
      packageName: context.packageName,
    });
    await this.write(mainMesonBuild, buildDirPath, "meson.build");
    await this.write(packageJson, buildDirPath, `${context.appID}.json`);
  }
  async prepareBuildFiles(appName, buildDirPath) {
    const context = {
      appName,
      appVersion: this.config.applicationVersion,
      appID: `org.gnome.${appName}`,
      packageName: `${(0, import_pascal_to_kebab.pascalToKebab)(appName)}`,
    };
    await this.createDataDir(buildDirPath);
    await this.createMesonDir(buildDirPath);
    await this.createPoDir(buildDirPath);
    await this.prepareMainBuildDirFiles(buildDirPath, context);
    await this.prepareSrcDirFiles(
      import_path.default.resolve(buildDirPath, "src"),
      context
    );
    await this.prepareDataDirFiles(
      import_path.default.resolve(buildDirPath, "data"),
      context
    );
    await this.prepareMesonDirFiles(
      import_path.default.resolve(buildDirPath, "meson"),
      context
    );
    await this.preparePoDirFiles(
      import_path.default.resolve(buildDirPath, "po"),
      context
    );
    return context;
  }
  async main() {
    console.log(import_chalk.default.blueBright("Building package..."));
    const appName = this.appName;
    const buildDirPath = import_path.default.resolve(
      this.cwd,
      this.config.outDir,
      ".build"
    );
    this.resources = new import_app_resources.AppResources(appName);
    if ((0, import_fs.existsSync)(buildDirPath))
      await new Promise((resolve, reject) => {
        (0, import_rimraf.default)(buildDirPath, {}, (e) => {
          if (e) reject(e);
          else resolve();
        });
      });
    await import_esbuild.default.build({
      target: "es2020",
      format: "esm",
      inject: (0, import_get_polyfills.getPolyfills)(this),
      entryPoints: [
        import_path.default.resolve(this.cwd, this.config.entrypoint),
      ],
      outfile: import_path.default.resolve(buildDirPath, "src", "main.js"),
      plugins: (0, import_get_plugins.getPlugins)(this),
      minify: this.config.minify ?? (this.isDev ? false : true),
      treeShaking: this.config.treeShake ?? (this.isDev ? false : true),
      jsx: "transform",
      keepNames: true,
      bundle: true,
      watch: false,
    });
    const { packageName, appVersion } = await this.prepareBuildFiles(
      appName,
      buildDirPath
    );
    await new import_command.Command("meson", ["setup", "_build"], {
      cwd: buildDirPath,
    }).run();
    await new import_command.Command(
      "meson",
      ["compile", "--clean", "-C", "_build"],
      {
        cwd: buildDirPath,
      }
    ).run();
    await new Promise((resolve, reject) => {
      import_tar.default.create(
        {
          gzip: true,
          cwd: buildDirPath,
          file: import_path.default.resolve(
            this.cwd,
            this.config.outDir,
            `${packageName}-${appVersion}.tar.gz`
          ),
          prefix: packageName,
        },
        (0, import_fs.readdirSync)(buildDirPath),
        (e) => (e ? reject(e) : resolve())
      );
    });
    console.log(import_chalk.default.greenBright("Package created."));
  }
};
