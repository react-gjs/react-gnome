import type esbuild from "esbuild";
import path from "path";
import type { Config } from "../../config/config-type";
import { getDirPath } from "../../get-dirpath/get-dirpath";
import type { DeepReadonly, Program } from "../../programs/base";
import { POLYFILL_IMPORT_NS } from "./import-polyfills";

type PolyfillMapDef = {
  matcher: RegExp;
  configFlag: (config: DeepReadonly<Config>) => boolean;
  filename: string;
};

export const createNodePolyfillMap = (polyfills: Array<PolyfillMapDef>) => {
  return {
    addResolvers(program: Program, build: esbuild.PluginBuild) {
      const rootPath = getDirPath();

      for (const pollyfill of polyfills) {
        if (pollyfill.configFlag(program.config)) {
          build.onResolve({ filter: pollyfill.matcher }, () => {
            return {
              path: path.resolve(rootPath, "polyfills/esm", pollyfill.filename),
              namespace: POLYFILL_IMPORT_NS,
            };
          });
        }
      }
    },
  };
};
