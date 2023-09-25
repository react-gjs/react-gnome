"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
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
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/utils/get-polyfills.ts
var get_polyfills_exports = {};
__export(get_polyfills_exports, {
  getGlobalPolyfills: () => getGlobalPolyfills
});
module.exports = __toCommonJS(get_polyfills_exports);
var import_esbuild = __toESM(require("esbuild"));
var import_path = __toESM(require("path"));
var import_get_dirpath = require("../get-dirpath/get-dirpath.cjs");
var getGlobalPolyfills = (program) => {
  const polyfills = { ...program.config.polyfills };
  if (polyfills?.XMLHttpRequest) {
    polyfills.URL = true;
  }
  if (polyfills?.URL || polyfills.node?.querystring) {
    polyfills.Buffer = true;
  }
  const polyFilepaths = [];
  if (polyfills?.Buffer) {
    polyFilepaths.push("./polyfills/esm/buffer.mjs");
  }
  if (polyfills?.URL) {
    polyFilepaths.push("./polyfills/esm/url.mjs");
  }
  if (polyfills?.fetch) {
    polyFilepaths.push("./polyfills/esm/fetch.mjs");
  }
  if (polyfills?.Blob) {
    polyFilepaths.push("./polyfills/esm/blob.mjs");
  }
  if (polyfills?.FormData) {
    polyFilepaths.push("./polyfills/esm/form-data.mjs");
  }
  if (polyfills?.XMLHttpRequest) {
    polyFilepaths.push("./polyfills/esm/xml-http-request.mjs");
  }
  if (polyfills?.base64) {
    polyFilepaths.push("./polyfills/esm/base64.mjs");
  }
  if (polyfills?.AbortController) {
    polyFilepaths.push("./polyfills/esm/abort-controller.mjs");
  }
  if (polyfills?.WebSocket) {
    polyFilepaths.push("./polyfills/esm/websocket.mjs");
  }
  const customPolyfills = [];
  if (program.config.customPolyfills) {
    const rootPath = (0, import_get_dirpath.getDirPath)();
    for (const customPoly of program.config.customPolyfills) {
      if (!customPoly.importName) {
        const base = import_path.default.relative(rootPath, program.cwd);
        customPolyfills.push(import_path.default.join(base, customPoly.filepath));
      }
    }
  }
  return buildPolyfillsBundle(polyFilepaths, customPolyfills);
};
async function buildPolyfillsBundle(polyfillsPaths, customPolyfills) {
  const rootPath = (0, import_get_dirpath.getDirPath)();
  const index = (
    /* js */
    `
import { registerPolyfills } from "./polyfills/esm/shared/polyfill-global.mjs";
${polyfillsPaths.map((p) => (
      /* js */
      `import "${p}";`
    )).join("\n")}
${customPolyfills.map((p, i) => (
      /* js */
      `import p${i} from "${p}";`
    )).join("\n")}
${customPolyfills.map(
      (_, i) => (
        /* js */
        `
const p${i}keys = Object.keys(p${i});
registerPolyfills(...p${i}keys)(() => {
  return p${i};
})
`
      )
    ).join("\n")}
`.trim()
  );
  const requirements = [];
  const result = await import_esbuild.default.build({
    stdin: {
      contents: index,
      loader: "ts",
      resolveDir: rootPath,
      sourcefile: "polyfills.ts"
    },
    bundle: true,
    write: false,
    format: "iife",
    target: "esnext",
    plugins: [
      {
        name: "replace-gi-imports",
        setup(build) {
          build.onResolve({ filter: /^gi:\/\/.+/ }, (args) => {
            return {
              namespace: "gi",
              path: args.path.replace(/^gi:/, "")
            };
          });
          build.onLoad({ namespace: "gi", filter: /.*/ }, (args) => {
            const name = args.path.replace(/^\/\//, "").replace(/\?.+/, "");
            const version = args.path.indexOf("?") !== -1 ? args.path.slice(
              args.path.indexOf("?") + "version=".length + 1
            ) : void 0;
            requirements.push([name, version]);
            return {
              contents: (
                /* js */
                `export default ${name};`
              )
            };
          });
        }
      }
    ]
  });
  if (result.errors.length > 0) {
    throw new Error(result.errors[0].text);
  }
  const [out] = result.outputFiles;
  return {
    bundle: out.text,
    requirements
  };
}
