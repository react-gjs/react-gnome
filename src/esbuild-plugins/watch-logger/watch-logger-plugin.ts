import type esbuild from "esbuild";
import { html, Output } from "termx-markup";

export const watchLoggerPlugin = () => {
  let isFirstBuild = true;
  return {
    name: "react-gnome-watch-logger-esbuild-plugin",
    setup(build: esbuild.PluginBuild) {
      build.onStart(() => {
        if (!isFirstBuild) {
          Output.print(
            html`<span color="yellow">Changes detected, rebuilding...</span>`,
          );
        } else {
          isFirstBuild = false;
        }
      });
    },
  };
};
