/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/no-require-imports */
const path = require("path");

const getDefault = (module: any) =>
  typeof module === "object" && "default" in module ? module.default : module;

export const evalJsConfigFile = async (
  config: string,
): Promise<() => unknown> => {
  const ext = path.extname(config);
  if (ext === ".mjs" || ext === ".mts") {
    throw new Error(
      `Invalid config file: react-gnome CLI is running in CommonJS mode and can accept only configs in CommonJS module format. To run react-gnome in ESM mode, set the 'type' field in your package.json to 'module'.`,
    );
  }

  const defaultExport = getDefault(require(config));

  if (typeof defaultExport === "function") {
    return defaultExport;
  }

  throw new Error(
    `The default export of the config file must be a function, but it was a ${typeof defaultExport}`,
  );
};
