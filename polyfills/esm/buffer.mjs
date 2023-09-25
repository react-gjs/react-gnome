// src/polyfills/buffer.ts
import { Buffer as BufferPolyfill } from "buffer";
import { registerPolyfills } from "./shared/polyfill-global.mjs";
registerPolyfills("Buffer")(() => {
  return {
    Buffer: BufferPolyfill
  };
});
