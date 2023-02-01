// src/init-project/config-file.ts
var getProjectConfigFile = () => (
  /* ts */
  `
export default () => {
  /** @type {import("react-gnome").BuildConfig} */
  const config = {
    applicationName: "ReactGnomeApp",
    applicationVersion: "1.0.0",
    entrypoint: "./src/start.tsx",
    outDir: "./dist",
    giVersions: {
      Soup: "2.4",
    },
  };

  return config;
};
`.trim() + "\n"
);
export {
  getProjectConfigFile
};
