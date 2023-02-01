// src/get-dirpath/get-dirpath.esm.ts
import path from "path";
import { fileURLToPath } from "url";
var getDirPath = () => {
  const __dirname = fileURLToPath(new URL(".", import.meta.url));
  return path.resolve(__dirname, "../../..");
};
export {
  getDirPath
};
