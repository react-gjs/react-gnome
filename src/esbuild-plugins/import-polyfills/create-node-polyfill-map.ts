import type esbuild from "esbuild";
import path from "path";
import type { Config } from "../../config/config-type";
import type { DeepReadonly, Program } from "../../programs/base";

type PolyfillMapDef = {
  matcher: RegExp;
  configFlag: (config: DeepReadonly<Config>) => boolean;
  filename: string;
};

export const createNodePolyfillMap = (polyfills: Array<PolyfillMapDef>) => {
  return {
    addResolvers(program: Program, build: esbuild.PluginBuild) {
      for (const pollyfill of polyfills) {
        if (pollyfill.configFlag(program.config)) {
          build.onResolve({ filter: pollyfill.matcher }, (args) => {
            return build.resolve(
              "react-gnome/" + path.join("polyfills/esm", pollyfill.filename),
              {
                importer: args.importer,
                namespace: args.namespace,
                kind: args.kind,
                pluginData: args.pluginData,
                resolveDir: args.resolveDir,
              },
            );
          });
        }
      }
    },
  };
};
