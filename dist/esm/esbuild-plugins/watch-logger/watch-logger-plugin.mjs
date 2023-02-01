// src/esbuild-plugins/watch-logger/watch-logger-plugin.ts
import { html, Output } from "termx-markup";
var watchLoggerPlugin = () => {
  let isFirstBuild = true;
  return {
    name: "react-gnome-watch-logger-esbuild-plugin",
    setup(build) {
      build.onStart(() => {
        if (!isFirstBuild) {
          Output.print(
            html`<span color="yellow">Changes detected, rebuilding...</span>`
          );
        } else {
          isFirstBuild = false;
        }
      });
    }
  };
};
export {
  watchLoggerPlugin
};
