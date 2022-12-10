import { spawn } from "child_process";
import type esbuild from "esbuild";

export const startAppPlugin = (directory: string) => {
  let cleanup = () => {};

  return {
    name: "react-gnome-start-app-esbuild-plugin",
    setup(build: esbuild.PluginBuild) {
      build.onEnd(async () => {
        cleanup();

        // spawn the bash process
        const child = spawn("gjs", ["-m", "./index.js"], {
          stdio: "inherit",
          shell: true,
          cwd: directory,
        });

        const onChildOutput = (data: any) => {
          console.log(data.toString());
        };

        const onChildError = (data: any) => {
          console.error(data.toString());
        };

        const onExit = () => {
          process.kill(process.pid, "SIGINT");
        };

        child.stdout?.on("data", onChildOutput);
        child.stderr?.on("data", onChildError);
        child.on("exit", onExit);

        cleanup = () => {
          child.stdout?.off("data", onChildOutput);
          child.stderr?.off("data", onChildError);
          child.off("exit", onExit);

          child.kill();
        };
      });
    },
  };
};
