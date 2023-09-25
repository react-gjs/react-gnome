// src/polyfills/blob.ts
import { Blob as BlobPolyfill } from "buffer";
import { registerPolyfills } from "./shared/polyfill-global.mjs";
registerPolyfills("Blob")(() => {
  return {
    Blob: BlobPolyfill
  };
});
