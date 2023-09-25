var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};

// src/esbuild-plugins/react-gnome/react-gnome-plugin.ts
import fs from "fs/promises";
import path from "path";
import { generateUniqueName } from "../../utils/generate-unique-name.mjs";
import { GiImports } from "./default-gi-imports.mjs";
var ExternalImport = class {
  constructor(path2) {
    this.path = path2;
    __publicField(this, "importName");
    this.importName = "_" + path2.replace(/[^a-zA-Z]/g, "") + "_" + generateUniqueName(8);
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
      const gi = new GiImports(program.config.giVersions);
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
              const content = await fs.readFile(
                path.resolve(args.path),
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
        const bundle = await fs.readFile(build.initialOptions.outfile, "utf8");
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
        await fs.writeFile(
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
export {
  reactGnomePlugin
};
