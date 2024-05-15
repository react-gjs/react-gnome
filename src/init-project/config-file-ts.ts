export const getTsProjectConfigFile = () =>
  /* ts */ `
import { BuildConfig } from "@reactgjs/react-gnome";

export default () => {
  const config: BuildConfig = {
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
