import type { BuildOptions } from "esbuild";
import { Program } from "./base";

const defaultBuildOptions = {
  target: "es2022",
  format: "esm",
  jsx: "transform",
  keepNames: true,
  bundle: true,
  define: {
    console: "__console_proxy",
    setTimeout: "__setTimeout_proxy",
    setInterval: "__setInterval_proxy",
  },
} as const satisfies Partial<BuildOptions>;

type DefaultKeys = keyof typeof defaultBuildOptions;

export const createBuildOptions = (
  program: Program,
  options:
    & Omit<BuildOptions, DefaultKeys>
    & Partial<Pick<BuildOptions, DefaultKeys>>,
): BuildOptions => {
  return {
    sourcemap: "external",
    ...defaultBuildOptions,
    ...options,
    define: {
      __MODE__: JSON.stringify(program.isDev ? "development" : "production"),
      __SOURCE_MAPS_ENABLED__: String(!!program.config.sourcemap),
      ...defaultBuildOptions.define,
      ...options.define,
    },
    banner: {
      ...options.banner,
      js: options.banner?.js ? "\n" + options.banner.js : "",
    },
  };
};
