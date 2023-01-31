"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/esbuild-plugins/start-app/start-app-plugin.ts
var start_app_plugin_exports = {};
__export(start_app_plugin_exports, {
  startAppPlugin: () => startAppPlugin
});
module.exports = __toCommonJS(start_app_plugin_exports);
var import_child_process = require("child_process");
var import_left_pad = require("../../utils/left-pad.cjs");
var import_output_pipe = require("../../utils/output-pipe.cjs");
var import_sleep = require("../../utils/sleep.cjs");
var formatChildOutputLine = (line) => {
  const content = (0, import_left_pad.leftPad)(line.toString().trim(), 2);
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
        const child = (0, import_child_process.spawn)("meson", ["compile", "-C", "_build", "run"], {
          stdio: ["ignore", "pipe", "pipe"],
          shell: true,
          cwd: getCwd(),
          detached: true
        });
        const outPipe = new import_output_pipe.OutputPipe(child.stdout, process.stdout).addTransformer(formatChildOutputLine).start();
        const errPipe = new import_output_pipe.OutputPipe(child.stderr, process.stderr).addTransformer(formatChildOutputLine).start();
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
          await (0, import_sleep.sleep)(250);
        };
      });
    }
  };
};
