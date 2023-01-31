// src/esbuild-plugins/start-app/start-app-plugin.ts
import { spawn } from "child_process";
import { leftPad } from "../../utils/left-pad.mjs";
import { OutputPipe } from "../../utils/output-pipe.mjs";
import { sleep } from "../../utils/sleep.mjs";
var formatChildOutputLine = (line) => {
  const content = leftPad(line.toString().trim(), 2);
  return `${content}
`;
};
var startAppPlugin = (params) => {
  const { getCwd, program, beforeStart } = params;
  const onFirstBuild = {
    async beforeStart() {
      onFirstBuild.beforeStart = async () => {
      };
      await beforeStart?.();
    }
  };
  let cleanup = () => {
  };
  return {
    name: "react-gnome-start-app-esbuild-plugin",
    setup(build) {
      build.onEnd(async () => {
        await cleanup();
        await onFirstBuild.beforeStart();
        const child = spawn("meson", ["compile", "-C", "_build", "run"], {
          stdio: ["ignore", "pipe", "pipe"],
          shell: true,
          cwd: getCwd(),
          detached: true
        });
        const outPipe = new OutputPipe(child.stdout, process.stdout).addTransformer(formatChildOutputLine).start();
        const errPipe = new OutputPipe(child.stderr, process.stderr).addTransformer(formatChildOutputLine).start();
        const onExit = async () => {
          await program.esbuildCtx.cancel();
          await program.esbuildCtx.dispose();
        };
        child.on("exit", onExit);
        cleanup = async () => {
          outPipe.stop();
          errPipe.stop();
          child.off("exit", onExit);
          process.kill(-child.pid);
          await sleep(250);
        };
      });
    }
  };
};
export {
  startAppPlugin
};
