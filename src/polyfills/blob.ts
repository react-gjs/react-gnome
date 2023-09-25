import { Blob as BlobPolyfill } from "buffer";
import { registerPolyfills } from "./shared/polyfill-global";

registerPolyfills("Blob")(() => {
  return {
    Blob: BlobPolyfill,
  };
});
