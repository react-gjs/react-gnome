const errInvalidAppName = () => {
  throw new Error("Invalid application name.");
};

export const validateAppName = (appName: string) => {
  if (appName.length === 0) {
    return errInvalidAppName();
  }

  if (
    appName.startsWith("-") ||
    appName.endsWith("-") ||
    appName.startsWith("_") ||
    appName.endsWith("_")
  ) {
    return errInvalidAppName();
  }

  return appName;
};
