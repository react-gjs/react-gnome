/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/no-require-imports */

export const evalJsConfigFile = async (
  config: string
): Promise<() => unknown> => {
  const defaultExport = require(config);

  if (typeof defaultExport === "function") {
    return defaultExport;
  }

  throw new Error(
    `The default export of the config file must be a function, but it was a ${typeof defaultExport}`
  );
};
