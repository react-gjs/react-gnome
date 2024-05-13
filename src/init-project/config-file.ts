export const getProjectConfigFile = () =>
  /* ts */ `
export default () => {
  /** @type {import("@reactgjs/react-gnome").BuildConfig} */
  const config = {
    applicationName: "SampleApp",
    applicationVersion: "1.0.0",
    entrypoint: "./src/start.tsx",
    outDir: "./dist",
    giVersions: {
      Soup: "2.4",
    },
  };

  return config;
};
`.trim() + "\n";
