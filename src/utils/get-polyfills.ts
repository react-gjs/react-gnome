import fs from "fs";
import path from "path";
import { getDirPath } from "../get-dirpath/get-dirpath";
import type { Program } from "../programs/base";

export type Polyfills = {
  inject: string[];
  banner: string[];
};

export const getGlobalPolyfills = (program: Program): Polyfills => {
  const polyfills = { ...program.config.polyfills };

  if (polyfills?.XMLHttpRequest) {
    polyfills.URL = true;
  }

  if (polyfills?.URL || polyfills.node?.querystring) {
    polyfills.Buffer = true;
  }

  const results: Polyfills = {
    inject: [],
    banner: [],
  };

  const rootPath = getDirPath();

  if (polyfills?.Buffer) {
    results.inject.push(path.resolve(rootPath, "polyfills/esm/buffer.mjs"));
  }

  if (polyfills?.URL) {
    results.banner.push(
      fs.readFileSync(path.resolve(rootPath, "polyfills/esm/url.mjs"), "utf-8"),
    );
  }

  if (polyfills?.fetch) {
    results.inject.push(path.resolve(rootPath, "polyfills/esm/fetch.mjs"));
  }

  if (polyfills?.Blob) {
    results.inject.push(path.resolve(rootPath, "polyfills/esm/blob.mjs"));
  }

  if (polyfills?.FormData) {
    results.inject.push(path.resolve(rootPath, "polyfills/esm/form-data.mjs"));
  }

  if (polyfills?.XMLHttpRequest) {
    results.inject.push(
      path.resolve(rootPath, "polyfills/esm/xml-http-request.mjs"),
    );
  }

  if (polyfills?.base64) {
    results.inject.push(path.resolve(rootPath, "polyfills/esm/base64.mjs"));
  }

  if (polyfills?.AbortController) {
    results.inject.push(
      path.resolve(rootPath, "polyfills/esm/abort-controller.mjs"),
    );
  }

  if (polyfills?.WebSocket) {
    results.inject.push(path.resolve(rootPath, "polyfills/esm/websocket.mjs"));
  }

  if (program.config.customPolyfills) {
    for (const customPoly of program.config.customPolyfills) {
      // polyfills with an import name are handled by the
      // `importPolyfillsPlugin`
      if (!customPoly.importName)
        results.inject.push(path.resolve(program.cwd, customPoly.filepath));
    }
  }

  return results;
};
