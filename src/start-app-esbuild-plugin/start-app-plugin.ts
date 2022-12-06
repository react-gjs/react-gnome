import { spawn } from "child_process";
import type esbuild from "esbuild";

export const startAppPlugin = (directory: string) => {
  let cleanup = () => {};

  return {
    name: "react-gtk-start-app-esbuild-plugin",
    setup(build: esbuild.PluginBuild) {
      build.onEnd(async () => {
        cleanup();

        // spawn the bash process
        const child = spawn("gjs", ["-m", "./index.js"], {
          stdio: "inherit",
          shell: true,
          cwd: directory,
        });

        const onExit = () => {
          process.exit();
        };

        child.on("exit", onExit);

        cleanup = () => {
          child.off("exit", onExit);
          child.kill();
        };
      });
    },
  };
};
