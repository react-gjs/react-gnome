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
var import_path = __toESM(require("path"));
var import_generate_unique_name = require("../../utils/generate-unique-name.cjs");
var import_default_gi_imports = require("./default-gi-imports.cjs");
var ExternalImport = class {
  constructor(path2) {
    this.path = path2;
    __publicField(this, "importName");
    this.importName = "_" + path2.replace(/[^a-zA-Z]/g, "") + "_" + (0, import_generate_unique_name.generateUniqueName)(8);
  }
  toImportStatement() {
    return `import ${this.importName} from "${this.path}";`;
  }
  toExportStatement() {
    return `module.exports = ${this.importName};`;
  }
};
var reactGnomePlugin = (program, options) => {
  const externalPackages = new Set(program.config.externalPackages ?? []);
  externalPackages.add("system");
  externalPackages.add("gettext");
  return {
    name: "react-gnome-esbuild-plugin",
    setup(build) {
      const gi = new import_default_gi_imports.GiImports(program.config.giVersions);
      const externalImports = [];
      for (const [name, version] of options.giRequirements ?? []) {
        gi.add(name, version);
      }
      if (program.resources) {
        build.onLoad(
          {
            filter: /(.*\.(jpg|jpeg|png|webp|webm|svg|mpeg|mp4|ui))|(.*\.resource\.[\w\d]*)/i
          },
          (args) => {
            const resource = program.resources.registerResource(args.path);
            return {
              contents: (
                /* js */
                `
                const resource = ${JSON.stringify(resource.resourceString)};
                export default resource;
              `
              )
            };
          }
        );
        if (program.type === "start") {
          build.onLoad(
            {
              filter: /.*\.css$/i
            },
            async (args) => {
              const resource = program.resources.registerResource(args.path);
              const content = await import_promises.default.readFile(
                import_path.default.resolve(args.path),
                "utf-8"
              );
              return {
                contents: (
                  /* js */
                  `
                import "react-gjs-renderer"; // renderer mus be imported before styles are added

                const resource = ${JSON.stringify(resource.resourceString)};

                if(applicationCss) {
                  const css = ${JSON.stringify(content)};

                  applicationCss.addStyles(css);
                }

                export default resource;
              `
                )
              };
            }
          );
        } else {
          build.onLoad(
            {
              filter: /.*\.css$/i
            },
            (args) => {
              const resource = program.resources.registerResource(args.path);
              return {
                contents: (
                  /* js */
                  `
                import "react-gjs-renderer"; // renderer mus be imported before styles are added

                const resource = ${JSON.stringify(resource.resourceString)};

                if(applicationCss) {
                  applicationCss.addStyles({ 
                    resource: resource.substring("resource://".length),
                  });
                }

                export default resource;
              `
                )
              };
            }
          );
        }
      }
      build.onResolve(
        {
          filter: /^gapp:(env)$/
        },
        (args) => {
          return {
            namespace: "gapp",
            path: "env"
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
      build.onLoad({ filter: /.*/, namespace: "gi" }, async (args) => {
        const name = args.path.replace(/(^gi:\/\/)|(^gi:)|(^\/\/)|(\?.+)/g, "");
        const vmatch = args.path.match(/^\/\/.+?\?version=(.+?)$/);
        const version = vmatch ? vmatch[1] : void 0;
        if (!name) {
          throw new Error(`Invalid gi import: ${args.path}`);
        }
        gi.add(name, version);
        return {
          contents: `export default ${name};`
        };
      });
      build.onResolve({ filter: /.*/ }, (args) => {
        if (externalPackages.has(args.path)) {
          return {
            path: args.path,
            namespace: "external-import"
          };
        }
      });
      build.onLoad({ filter: /.*/, namespace: "external-import" }, (args) => {
        let externalImport = externalImports.find((e) => e.path === args.path);
        if (!externalImport) {
          externalImport = new ExternalImport(args.path);
          externalImports.push(externalImport);
        }
        return {
          contents: externalImport.toExportStatement()
        };
      });
      build.onEnd(async () => {
        const bundle = await import_promises.default.readFile(build.initialOptions.outfile, "utf8");
        const imports = [
          gi.toJavaScript(),
          ...externalImports.map((e) => e.toImportStatement())
        ];
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
${bundle}
};
`
          ].join("\n")
        );
      });
    }
  };
};
