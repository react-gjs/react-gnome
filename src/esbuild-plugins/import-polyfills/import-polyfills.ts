import type esbuild from "esbuild";
import path from "path";
import type { Program } from "../../programs/base";
import { createNodePolyfillMap } from "./create-node-polyfill-map";

export const POLYFILL_IMPORT_NS = "react-gtk-polyfills";

const NodePolyfills = createNodePolyfillMap([
  {
    matcher: /^(fs|node:fs)$/,
    configFlag: (c) => !!c.polyfills?.node?.fs,
    filename: "fs.mjs",
  },
  {
    matcher: /^(fs\/promises|node:fs\/promises)$/,
    configFlag: (c) => !!c.polyfills?.node?.fs,
    filename: "fs-promises.mjs",
  },
  {
    matcher: /^(path|node:path)$/,
    configFlag: (c) => !!c.polyfills?.node?.path,
    filename: "path.mjs",
  },
  {
    matcher: /^(querystring|node:querystring)$/,
    configFlag: (c) => !!c.polyfills?.node?.querystring,
    filename: "querystring.mjs",
  },
  {
    matcher: /^(os|node:os)$/,
    configFlag: (c) => !!c.polyfills?.node?.os,
    filename: "node-os.mjs",
  },
]);

export const importPolyfillsPlugin = (program: Program) => {
  return {
    name: "react-gtk-import-polyfills-esbuild-plugin",
    setup(build: esbuild.PluginBuild) {
      NodePolyfills.addResolvers(program, build);

      if (program.config.customPolyfills) {
        for (const customPoly of program.config.customPolyfills) {
          if (customPoly.importName) {
            build.onResolve({ filter: /.*/ }, (arg) => {
              if (customPoly.importName === arg.path) {
                return {
                  path: path.join(program.cwd, customPoly.filepath),
                };
              }
            });
          }
        }
      }
    },
  };
};
