import type { BuildOptions } from "esbuild";

const consoleLogReplacement = /**
   * Js
   */
  `
const __console_proxy = {
  log: console.log?.bind(console),
  info: console.info?.bind(console),
  warn: console.warn?.bind(console),
  error: console.error?.bind(console),
  debug: console.debug?.bind(console),
  group: console.group?.bind(console),
  groupEnd: console.groupEnd?.bind(console),
  groupCollapsed: console.groupCollapsed?.bind(console),
  table: console.table?.bind(console),
  dir: console.dir?.bind(console),
  dirxml: console.dirxml?.bind(console),
  trace: console.trace?.bind(console),
  clear: console.clear?.bind(console),
  count: console.count?.bind(console),
  countReset: console.countReset?.bind(console),
  assert: console.assert?.bind(console),
  profile: console.profile?.bind(console),
  profileEnd: console.profileEnd?.bind(console)
};
`;

const defaultBuildOptions = {
  target: "es2022",
  format: "esm",
  jsx: "transform",
  keepNames: true,
  bundle: true,
  banner: {
    js: consoleLogReplacement,
  },
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
    ...defaultBuildOptions,
    ...options,
    define: {
      ...defaultBuildOptions.define,
      ...options.define,
    },
    banner: {
      ...options.banner,
      js: defaultBuildOptions.banner.js
        + (options.banner?.js ? "\n" + options.banner.js : ""),
    },
  };
};
