import GLib from "gi://GLib?version=2.0";

export function atob(data: string) {
  const decodedData = GLib.base64_decode(data);
  return new TextDecoder().decode(decodedData);
}

export function btoa(data: string) {
  const encodedData = new TextEncoder().encode(data);
  return GLib.base64_encode(encodedData)!;
}
