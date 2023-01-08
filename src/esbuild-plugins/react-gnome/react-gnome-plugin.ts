import type esbuild from "esbuild";
import fs from "fs/promises";
import type { Program } from "../../programs/base";
import { getDefaultGiImports } from "./default-gi-imports";

export const reactGnomePlugin = (program: Program) => {
  return {
    name: "react-gnome-esbuild-plugin",
    setup(build: esbuild.PluginBuild) {
      if (program.resources)
        build.onLoad(
          {
            filter:
              /(.*\.(jpg|jpeg|png|webp|mp4|svg|css|ui))|.*\.resource\.[\w\d]*/i,
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
          filter: /^system:.*$/,
        },
        (args) => {
          return {
            namespace: "system",
            path: args.path.replace(/^system:/, ""),
          };
        }
      );

      build.onLoad(
        {
          filter: /^env$/,
          namespace: "system",
        },
        () => {
          return {
            contents: program.envs.toJavascriptModule(),
          };
        }
      );

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
        return {
          contents: `export default ${name};`,
        };
      });

      build.onEnd(async () => {
        const outputFile = await fs.readFile(
          build.initialOptions.outfile!,
          "utf8"
        );

        const imports = getDefaultGiImports(program.config.giVersions);

        await fs.writeFile(
          build.initialOptions.outfile!,
          [imports, `export function main() {\n${outputFile}\n}`].join("\n")
        );
      });
    },
  };
};
