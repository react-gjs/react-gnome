import { spawn } from "child_process";
import type esbuild from "esbuild";
import type { Program } from "../../programs/base";

export const startAppPlugin = (params: {
  getCwd: () => string;
  beforeStart?: () => any;
  program: Program;
}) => {
  const { getCwd, program, beforeStart } = params;
  let cleanup = () => {};

  return {
    name: "react-gnome-start-app-esbuild-plugin",
    setup(build: esbuild.PluginBuild) {
      build.onEnd(async () => {
        cleanup();

        await beforeStart?.();

        // spawn the bash process
        const child = spawn("meson", ["compile", "-C", "_build", "run"], {
          stdio: "inherit",
          shell: true,
          cwd: getCwd(),
        });

        const onChildOutput = (data: any) => {
          console.log(data.toString());
        };

        const onChildError = (data: any) => {
          console.error(data.toString());
        };

        const onExit = () => {
          program.esbuildCtx.cancel();
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
