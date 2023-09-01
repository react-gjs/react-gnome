"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
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
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/esbuild-plugins/import-polyfills/import-polyfills.ts
var import_polyfills_exports = {};
__export(import_polyfills_exports, {
  POLYFILL_IMPORT_NS: () => POLYFILL_IMPORT_NS,
  importPolyfillsPlugin: () => importPolyfillsPlugin
});
module.exports = __toCommonJS(import_polyfills_exports);
var import_create_node_polyfill_map = require("./create-node-polyfill-map.cjs");
var POLYFILL_IMPORT_NS = "react-gnome-polyfills";
var NodePolyfills = (0, import_create_node_polyfill_map.createNodePolyfillMap)([
  {
    matcher: /^(fs)|(node:fs)$/,
    configFlag: (c) => !!c.polyfills?.node?.fs,
    filename: "fs.mjs"
  },
  {
    matcher: /^(fs\/promises)|(node:fs\/promises)$/,
    configFlag: (c) => !!c.polyfills?.node?.fs,
    filename: "fs-promises.mjs"
  },
  {
    matcher: /^(path)|(node:path)$/,
    configFlag: (c) => !!c.polyfills?.node?.path,
    filename: "path.mjs"
  },
  {
    matcher: /^(querystring)|(node:querystring)$/,
    configFlag: (c) => !!c.polyfills?.node?.querystring,
    filename: "querystring.mjs"
  },
  {
    matcher: /^(os)|(node:os)$/,
    configFlag: (c) => !!c.polyfills?.node?.os,
    filename: "node-os.mjs"
  }
]);
var importPolyfillsPlugin = (program) => {
  return {
    name: "react-gnome-import-polyfills-esbuild-plugin",
    setup(build) {
      NodePolyfills.addResolvers(program, build);
      if (program.config.customPolyfills) {
        for (const customPoly of program.config.customPolyfills) {
          if (customPoly.importName) {
            build.onResolve({ filter: /.*/ }, (arg) => {
              if (customPoly.importName === arg.path) {
                return {
                  path: customPoly.filepath,
                  namespace: POLYFILL_IMPORT_NS
                };
              }
            });
          }
        }
      }
      if (program.config.customPolyfills) {
        build.onLoad(
          {
            filter: /.*/,
            namespace: POLYFILL_IMPORT_NS
          },
          (args) => {
            return {
              contents: (
                /* js */
                `
                import * as _mod from "${args.path}";
                const _default = _mod.default ?? _mod;
                export default _default;
                export * from "${args.path}";
              `.trim()
              ),
              resolveDir: program.cwd
            };
          }
        );
      }
    }
  };
};
