import path from "path";
import { getDirPath } from "../get-dirpath/get-dirpath";
import type { Program } from "../programs/base";

export const getPolyfills = (program: Program): string[] => {
  const polyfills = { ...program.config.polyfills };

  if (polyfills?.XMLHttpRequest) {
    polyfills.URL = true;
  }

  if (polyfills?.URL) {
    polyfills.Buffer = true;
  }

  const polyfillPaths: string[] = [];

  const rootPath = getDirPath();

  if (polyfills?.fetch) {
    polyfillPaths.push(path.resolve(rootPath, "polyfills/esm/fetch.mjs"));
  }

  if (polyfills?.Buffer) {
    polyfillPaths.push(path.resolve(rootPath, "polyfills/esm/buffer.mjs"));
  }

  if (polyfills?.Blob) {
    polyfillPaths.push(path.resolve(rootPath, "polyfills/esm/blob.mjs"));
  }

  if (polyfills?.URL) {
    polyfillPaths.push(path.resolve(rootPath, "polyfills/esm/url.mjs"));
  }

  if (polyfills?.FormData) {
    polyfillPaths.push(path.resolve(rootPath, "polyfills/esm/form-data.mjs"));
  }

  if (polyfills?.XMLHttpRequest) {
    polyfillPaths.push(
      path.resolve(rootPath, "polyfills/esm/xml-http-request.mjs")
    );
  }

  if (polyfills?.base64) {
    polyfillPaths.push(path.resolve(rootPath, "polyfills/esm/base64.mjs"));
  }

  if (polyfills?.AbortController) {
    polyfillPaths.push(
      path.resolve(rootPath, "polyfills/esm/abort-controller.mjs")
    );
  }

  if (program.config.customPolyfills) {
    for (const customPoly of program.config.customPolyfills) {
      // polyfills with an import name are handled by the
      // `importPolyfillsPlugin`
      if (!customPoly.importName)
        polyfillPaths.push(path.resolve(program.cwd, customPoly.filepath));
    }
  }

  return polyfillPaths;
};
