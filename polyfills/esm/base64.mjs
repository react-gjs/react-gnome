// src/polyfills/base64.ts
import GLib from "gi://GLib?version=2.0";
function atob(data) {
  const decodedData = GLib.base64_decode(data);
  return new TextDecoder().decode(decodedData);
}
function btoa(data) {
  const encodedData = new TextEncoder().encode(data);
  return GLib.base64_encode(encodedData);
}
export {
  atob,
  btoa
};
