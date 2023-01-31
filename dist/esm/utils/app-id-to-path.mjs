// src/utils/app-id-to-path.ts
var appIDToPath = (appID) => {
  return appID.replace(/\./g, "/");
};
export {
  appIDToPath
};
