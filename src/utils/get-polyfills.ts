import path from "path";
import { getDirPath } from "../get-dirpath/get-dirpath";
import type { Program } from "../programs/base";

export const getPolyfills = (program: Program) => {
  if (program.config.polyfills?.XMLHttpRequest) {
    program.config.polyfills.URL = true;
  }

  if (program.config.polyfills?.URL || program.config.polyfills?.node?.fs) {
    program.config.polyfills.Buffer = true;
  }

  const polyfills: string[] = [];

  const rootPath = getDirPath();

  if (program.config.polyfills?.fetch) {
    polyfills.push(path.resolve(rootPath, "polyfills/esm/fetch.mjs"));
  }

  if (program.config.polyfills?.Buffer) {
    polyfills.push(path.resolve(rootPath, "polyfills/esm/buffer.mjs"));
  }

  if (program.config.polyfills?.Blob) {
    polyfills.push(path.resolve(rootPath, "polyfills/esm/blob.mjs"));
  }

  if (program.config.polyfills?.URL) {
    polyfills.push(path.resolve(rootPath, "polyfills/esm/url.mjs"));
  }

  if (program.config.polyfills?.FormData) {
    polyfills.push(path.resolve(rootPath, "polyfills/esm/form-data.mjs"));
  }

  if (program.config.polyfills?.XMLHttpRequest) {
    polyfills.push(
      path.resolve(rootPath, "polyfills/esm/xml-http-request.mjs")
    );
  }

  if (program.config.polyfills?.base64) {
    polyfills.push(path.resolve(rootPath, "polyfills/esm/base64.mjs"));
  }

  if (program.config.polyfills?.AbortController) {
    polyfills.push(
      path.resolve(rootPath, "polyfills/esm/abort-controller.mjs")
    );
  }

  return polyfills;
};
