export const evalJsConfigFile = async (
  config: string
): Promise<() => unknown> => {
  const defaultExport = await import(config);

  if (typeof defaultExport.default === "function") {
    return defaultExport.default;
  }

  throw new Error(
    `The default export of the config file must be a function, but it was a ${typeof defaultExport.default}`
  );
};
