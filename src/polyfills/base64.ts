import GLib from "gi://GLib?version=2.0";
import { registerPolyfills } from "./shared/polyfill-global";

registerPolyfills(
  "atob",
  "btoa",
)(() => {
  function atob(data: string) {
    const decodedData = GLib.base64_decode(data);
    return new TextDecoder().decode(decodedData);
  }

  function btoa(data: string) {
    const encodedData = new TextEncoder().encode(data);
    return GLib.base64_encode(encodedData)!;
  }

  return {
    atob,
    btoa,
  };
});
