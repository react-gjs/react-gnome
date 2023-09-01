import type { BuildOptions } from "esbuild";

export const defaultBuildOptions = {
  target: "es2022",
  format: "esm",
  jsx: "transform",
  keepNames: true,
  bundle: true,
} as const satisfies Partial<BuildOptions>;
