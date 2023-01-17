import { spawn } from "child_process";
import type esbuild from "esbuild";
import type { Program } from "../../programs/base";
import { leftPad } from "../../utils/left-pad";
import { OutputPipe } from "../../utils/output-pipe";
import { sleep } from "../../utils/sleep";

const formatChildOutputLine = (line: string | Buffer) => {
  const content = leftPad(line.toString().trim(), 2);
  return `${content}\n`;
};

export const startAppPlugin = (params: {
  getCwd: () => string;
  beforeStart?: () => any;
  program: Program;
}) => {
  const { getCwd, program, beforeStart } = params;

  const onFirstBuild = {
    async beforeStart() {
      onFirstBuild.beforeStart = async () => {};
      await beforeStart?.();
    },
  };

  let cleanup: () => any = () => {};

  return {
    name: "react-gnome-start-app-esbuild-plugin",
    setup(build: esbuild.PluginBuild) {
      build.onEnd(async () => {
        await cleanup();
        await onFirstBuild.beforeStart();

        // spawn the bash process
        const child = spawn("meson", ["compile", "-C", "_build", "run"], {
          stdio: ["ignore", "pipe", "pipe"],
          shell: true,
          cwd: getCwd(),
          detached: true,
        });

        const outPipe = new OutputPipe(child.stdout, process.stdout)
          .addTransformer(formatChildOutputLine)
          .start();
        const errPipe = new OutputPipe(child.stderr, process.stderr)
          .addTransformer(formatChildOutputLine)
          .start();

        const onExit = async () => {
          await program.esbuildCtx.cancel();
          await program.esbuildCtx.dispose();
        };

        child.on("exit", onExit);

        cleanup = async () => {
          outPipe.stop();
          errPipe.stop();
          child.off("exit", onExit);
          process.kill(-child.pid!);
          await sleep(250);
        };
      });
    },
  };
};
