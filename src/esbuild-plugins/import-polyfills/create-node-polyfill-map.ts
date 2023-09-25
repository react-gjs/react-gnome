import type esbuild from "esbuild";
import path from "path";
import type { Config } from "../../config/config-type";
import { getDirPath } from "../../get-dirpath/get-dirpath";
import type { DeepReadonly, Program } from "../../programs/base";

type PolyfillMapDef = {
  matcher: RegExp;
  configFlag: (config: DeepReadonly<Config>) => boolean;
  filename: string;
};

export const createNodePolyfillMap = (polyfills: Array<PolyfillMapDef>) => {
  const rootPath = getDirPath();
  return {
    addResolvers(program: Program, build: esbuild.PluginBuild) {
      for (const pollyfill of polyfills) {
        if (pollyfill.configFlag(program.config)) {
          build.onResolve({ filter: pollyfill.matcher }, (args) => {
            return build.resolve(
              path.join(rootPath, "polyfills/esm", pollyfill.filename),
              {
                resolveDir: rootPath,
                kind: args.kind,
                importer: args.importer,
              },
            );
          });
        }
      }
    },
  };
};
