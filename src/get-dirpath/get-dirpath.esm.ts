import path from "path";
import { fileURLToPath } from "url";

export const getDirPath = () => {
  const __dirname = fileURLToPath(new URL(".", import.meta.url));
  return path.resolve(__dirname, "../../..");
};
