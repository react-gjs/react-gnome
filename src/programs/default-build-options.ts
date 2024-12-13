import type { BuildOptions } from "esbuild";

const defaultBuildOptions = {
  target: "es2022",
  format: "esm",
  jsx: "transform",
  keepNames: true,
  bundle: true,
  define: {
    console: "__console_proxy",
  },
} as const satisfies Partial<BuildOptions>;

type DefaultKeys = keyof typeof defaultBuildOptions;

export const createBuildOptions = (
  options:
    & Omit<BuildOptions, DefaultKeys>
    & Partial<Pick<BuildOptions, DefaultKeys>>,
): BuildOptions => {
  return {
    sourcemap: "external",
    ...defaultBuildOptions,
    ...options,
    define: {
      ...defaultBuildOptions.define,
      ...options.define,
    },
    banner: {
      ...options.banner,
      js: options.banner?.js ? "\n" + options.banner.js : "",
    },
  };
};
