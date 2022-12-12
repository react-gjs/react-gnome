import GLib from "gi://GLib";

export function atob(data: string) {
  const decodedData = GLib.base64_decode(data);
  return new TextDecoder().decode(decodedData);
}

export function btoa(data: string) {
  const buffer = new Uint8Array(data.length);
  for (let i = 0; i < data.length; i++) {
    buffer[i] = data.charCodeAt(i);
  }
  return GLib.base64_encode(buffer, buffer.byteLength);
}
