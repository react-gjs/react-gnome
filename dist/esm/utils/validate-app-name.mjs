// src/utils/validate-app-name.ts
var errInvalidAppName = () => {
  throw new Error("Invalid application name.");
};
var validateAppName = (appName) => {
  if (appName.length === 0) {
    return errInvalidAppName();
  }
  if (appName.startsWith("-") || appName.endsWith("-") || appName.startsWith("_") || appName.endsWith("_")) {
    return errInvalidAppName();
  }
  return appName;
};
export {
  validateAppName
};
