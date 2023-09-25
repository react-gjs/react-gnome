import { Buffer as BufferPolyfill } from "buffer";
import { registerPolyfills } from "./shared/polyfill-global";

registerPolyfills("Buffer")(() => {
  return {
    Buffer: BufferPolyfill,
  };
});
