import type esbuild from "esbuild";
import fs from "fs/promises";
import type { Config } from "../../config/config-schema";
import type { AppResources } from "../../utils/app-resources";
import { getDefaultGiImports } from "./default-gi-imports";

export const reactGnomePlugin = (config: Config, resources?: AppResources) => {
  return {
    name: "react-gnome-esbuild-plugin",
    setup(build: esbuild.PluginBuild) {
      if (resources)
        build.onLoad(
          {
            filter:
              /(.*\.(jpg|jpeg|png|webp|mp4|svg|css|ui))|.*\.resource\.[\w\d]*/i,
          },
          (args) => {
            const resource = resources.registerResource(args.path);
            return {
              contents: `const resource = "${resource.resourceString}";\nexport default resource;`,
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

        const imports = getDefaultGiImports(config.giVersions);

        await fs.writeFile(
          build.initialOptions.outfile!,
          [imports, `export function main() {\n${outputFile}\n}`].join("\n")
        );
      });
    },
  };
};
