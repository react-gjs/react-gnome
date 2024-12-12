export const getJsProjectConfigFile = () =>
  /* ts */ `
export default () => {
  /** @type {import("@reactgjs/react-gtk").BuildConfig} */
  const config = {
    applicationName: "SampleApp",
    applicationVersion: "1.0.0",
    entrypoint: "./src/start.jsx",
    outDir: "./dist",
    giVersions: {
      Soup: "2.4",
    },
  };

  return config;
};
`.trim() + "\n";
