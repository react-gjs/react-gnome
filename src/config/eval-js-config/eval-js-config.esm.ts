import path from "path";

export const evalJsConfigFile = async (
  config: string,
): Promise<() => unknown> => {
  const ext = path.extname(config);
  if (ext === ".cjs" || ext === ".cts") {
    throw new Error(
      `Invalid config file: react-gtk CLI is running in ESM mode and can only accept configs in ESModule format. To run react-gtk in CommonJS mode, set the 'type' field in your package.json to 'commonjs'.`,
    );
  }

  const defaultExport = await import(config);

  if (typeof defaultExport.default === "function") {
    return defaultExport.default;
  }

  throw new Error(
    `The default export of the config file must be a function, but it was a ${typeof defaultExport.default}`,
  );
};
