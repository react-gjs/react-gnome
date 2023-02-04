"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};

// src/esbuild-plugins/react-gnome/react-gnome-plugin.ts
var react_gnome_plugin_exports = {};
__export(react_gnome_plugin_exports, {
  reactGnomePlugin: () => reactGnomePlugin
});
module.exports = __toCommonJS(react_gnome_plugin_exports);
var import_promises = __toESM(require("fs/promises"));
var import_generate_unique_name = require("../../utils/generate-unique-name.cjs");
var import_default_gi_imports = require("./default-gi-imports.cjs");
var ExternalImport = class {
  constructor(path) {
    this.path = path;
    __publicField(this, "importName");
    this.importName = "_" + path.replace(/[^a-zA-Z]/g, "") + "_" + (0, import_generate_unique_name.generateUniqueName)(8);
  }
  toImportStatement() {
    return `import * as ${this.importName} from "${this.path}";`;
  }
  toExportStatement() {
    return `module.exports = ${this.importName};`;
  }
};
var reactGnomePlugin = (program) => {
  const externalPackages = new Set(program.config.externalPackages ?? []);
  externalPackages.add("system");
  externalPackages.add("gettext");
  return {
    name: "react-gnome-esbuild-plugin",
    setup(build) {
      const externalImports = [];
      if (program.resources)
        build.onLoad(
          {
            filter: /(.*\.(jpg|jpeg|png|webp|webm|svg|mpeg|mp4|css|ui))|(.*\.resource\.[\w\d]*)/i
          },
          (args) => {
            const resource = program.resources.registerResource(args.path);
            return {
              contents: `const resource = "${resource.resourceString}";
export default resource;`
            };
          }
        );
      build.onResolve(
        {
          filter: /^gapp:(env)$/
        },
        (args) => {
          return {
            namespace: "gapp",
            path: args.path.replace(/^gapp:/, "")
          };
        }
      );
      build.onLoad(
        {
          filter: /^env$/,
          namespace: "gapp"
        },
        () => {
          return {
            contents: program.envs.toJavascriptModule()
          };
        }
      );
      build.onResolve({ filter: /^gi?:\/\// }, (args) => ({
        path: args.path.replace(/^gi?:/, ""),
        namespace: "gi"
      }));
      build.onResolve({ filter: /.*/, namespace: "gi" }, (args) => ({
        path: args.path.replace(/^gi?:/, ""),
        namespace: "gi"
      }));
      build.onResolve({ filter: /.*/ }, (args) => {
        if (externalPackages.has(args.path)) {
          return {
            path: args.path,
            namespace: "external-import"
          };
        }
      });
      build.onLoad({ filter: /.*/, namespace: "external-import" }, (args) => {
        const externalImport = new ExternalImport(args.path);
        externalImports.push(externalImport);
        return {
          contents: externalImport.toExportStatement()
        };
      });
      build.onLoad({ filter: /.*/, namespace: "gi" }, async (args) => {
        const name = args.path.replace(/(^gi:\/\/)|(^gi:)|(^\/\/)|(\?.+)/g, "");
        return {
          contents: `export default ${name};`
        };
      });
      build.onEnd(async () => {
        const outputFile = await import_promises.default.readFile(
          build.initialOptions.outfile,
          "utf8"
        );
        const imports = [(0, import_default_gi_imports.getDefaultGiImports)(program.config.giVersions)];
        imports.push(...externalImports.map((e) => e.toImportStatement()));
        const gtkInit = program.config.giVersions?.Gtk === "4.0" ? (
          // eslint-disable-next-line quotes
          /* js */
          `Gtk.init();`
        ) : (
          // eslint-disable-next-line quotes
          /* js */
          `Gtk.init(null);`
        );
        await import_promises.default.writeFile(
          build.initialOptions.outfile,
          [
            ...imports,
            /* js */
            `
export function main() {
${gtkInit}

${outputFile}
};
`
          ].join("\n")
        );
      });
    }
  };
};
