import type esbuild from "esbuild";
import fs from "fs/promises";
import type { Program } from "../../programs/base";
import { generateUniqueName } from "../../utils/generate-unique-name";
import { GiImports } from "./default-gi-imports";

class ExternalImport {
  importName: string;

  constructor(public path: string) {
    this.importName =
      "_" + path.replace(/[^a-zA-Z]/g, "") + "_" + generateUniqueName(8);
  }

  toImportStatement() {
    return `import ${this.importName} from "${this.path}";`;
  }

  toExportStatement() {
    return `module.exports = ${this.importName};`;
  }
}

export const reactGnomePlugin = (program: Program) => {
  const externalPackages = new Set(program.config.externalPackages ?? []);
  externalPackages.add("system");
  externalPackages.add("gettext");

  return {
    name: "react-gnome-esbuild-plugin",
    setup(build: esbuild.PluginBuild) {
      const gi = new GiImports(program.config.giVersions);
      const externalImports: ExternalImport[] = [];

      if (program.resources)
        build.onLoad(
          {
            filter:
              /(.*\.(jpg|jpeg|png|webp|webm|svg|mpeg|mp4|css|ui))|(.*\.resource\.[\w\d]*)/i,
          },
          (args) => {
            const resource = program.resources!.registerResource(args.path);
            return {
              contents: `const resource = "${resource.resourceString}";\nexport default resource;`,
            };
          }
        );

      build.onResolve(
        {
          filter: /^gapp:(env)$/,
        },
        (args) => {
          return {
            namespace: "gapp",
            path: args.path.replace(/^gapp:/, ""),
          };
        }
      );

      build.onLoad(
        {
          filter: /^env$/,
          namespace: "gapp",
        },
        () => {
          return {
            contents: program.envs.toJavascriptModule(),
          };
        }
      );

      // #region gi imports

      build.onResolve({ filter: /^gi?:\/\// }, (args) => ({
        path: args.path.replace(/^gi?:/, ""),
        namespace: "gi",
      }));

      build.onResolve({ filter: /.*/, namespace: "gi" }, (args) => ({
        path: args.path.replace(/^gi?:/, ""),
        namespace: "gi",
      }));

      build.onLoad({ filter: /.*/, namespace: "gi" }, async (args) => {
        const name = args.path.replace(/(^gi:\/\/)|(^gi:)|(^\/\/)|(\?.+)/g, "");

        const vmatch = args.path.match(/^\/\/.+?\?version=(.+?)$/);
        const version = vmatch ? vmatch[1] : undefined;

        if (!name) {
          throw new Error(`Invalid gi import: ${args.path}`);
        }

        gi.add(name, version);

        return {
          contents: `export default ${name};`,
        };
      });

      // #endregion gi imports

      build.onResolve({ filter: /.*/ }, (args) => {
        if (externalPackages.has(args.path)) {
          return {
            path: args.path,
            namespace: "external-import",
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
          contents: externalImport.toExportStatement(),
        };
      });

      build.onEnd(async () => {
        const bundle = await fs.readFile(build.initialOptions.outfile!, "utf8");

        const imports = [
          gi.toJavaScript(),
          ...externalImports.map((e) => e.toImportStatement()),
        ];

        const gtkInit =
          (program.config.giVersions?.Gtk as string) === "4.0"
            ? // eslint-disable-next-line quotes
              /* js */ `Gtk.init();`
            : // eslint-disable-next-line quotes
              /* js */ `Gtk.init(null);`;

        await fs.writeFile(
          build.initialOptions.outfile!,
          [
            ...imports,
            /* js */ `
export function main() {
${gtkInit}
${bundle}
};
`,
          ].join("\n")
        );
      });
    },
  };
};
