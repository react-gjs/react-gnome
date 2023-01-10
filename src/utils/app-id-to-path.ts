export const appIDToPath = (appID: string) => {
  return appID.replace(/\./g, "/");
};
