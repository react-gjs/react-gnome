var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};

// src/esbuild-plugins/react-gnome/react-gnome-plugin.ts
import fs from "fs/promises";
import { generateUniqueName } from "../../utils/generate-unique-name.mjs";
import { getDefaultGiImports } from "./default-gi-imports.mjs";
var ExternalImport = class {
  constructor(path) {
    this.path = path;
    __publicField(this, "importName");
    this.importName = "_" + path.replace(/[^a-zA-Z]/g, "") + "_" + generateUniqueName(8);
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
        const outputFile = await fs.readFile(
          build.initialOptions.outfile,
          "utf8"
        );
        const imports = [getDefaultGiImports(program.config.giVersions)];
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
        await fs.writeFile(
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
export {
  reactGnomePlugin
};
