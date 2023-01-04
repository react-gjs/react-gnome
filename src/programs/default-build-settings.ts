import type esbuild from "esbuild";

export const DefaultBuildSettings = {
  target: "ESNext",
  format: "esm",
  jsx: "transform",
  bundle: true,
} satisfies esbuild.BuildOptions;
