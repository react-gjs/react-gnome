import chalk from "chalk";
import type esbuild from "esbuild";

export const watchLoggerPlugin = () => {
  let isFirstBuild = true;
  return {
    name: "react-gtk-watch-logger-esbuild-plugin",
    setup(build: esbuild.PluginBuild) {
      build.onStart(() => {
        if (!isFirstBuild) {
          console.log(chalk.yellowBright("Changes detected, rebuilding..."));
        } else {
          isFirstBuild = false;
        }
      });
    },
  };
};
