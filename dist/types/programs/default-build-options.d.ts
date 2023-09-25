import type { BuildOptions } from "esbuild";
declare const defaultBuildOptions: {
    readonly target: "es2022";
    readonly format: "esm";
    readonly jsx: "transform";
    readonly keepNames: true;
    readonly bundle: true;
    readonly banner: {
        readonly js: "\nconst __console_proxy = {\n  log: console.log?.bind(console),\n  info: console.info?.bind(console),\n  warn: console.warn?.bind(console),\n  error: console.error?.bind(console),\n  debug: console.debug?.bind(console),\n  group: console.group?.bind(console),\n  groupEnd: console.groupEnd?.bind(console),\n  groupCollapsed: console.groupCollapsed?.bind(console),\n  table: console.table?.bind(console),\n  dir: console.dir?.bind(console),\n  dirxml: console.dirxml?.bind(console),\n  trace: console.trace?.bind(console),\n  clear: console.clear?.bind(console),\n  count: console.count?.bind(console),\n  countReset: console.countReset?.bind(console),\n  assert: console.assert?.bind(console),\n  profile: console.profile?.bind(console),\n  profileEnd: console.profileEnd?.bind(console)\n};\n";
    };
    readonly define: {
        readonly console: "__console_proxy";
    };
};
type DefaultKeys = keyof typeof defaultBuildOptions;
export declare const createBuildOptions: (options: Omit<BuildOptions, DefaultKeys> & Partial<Pick<BuildOptions, DefaultKeys>>) => BuildOptions;
export {};
