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

// src/utils/command.ts
var command_exports = {};
__export(command_exports, {
  Command: () => Command
});
module.exports = __toCommonJS(command_exports);
var import_child_process = require("child_process");
var Command = class {
  constructor(command, args, options) {
    this.command = command;
    this.args = args;
    this.options = options;
  }
  async run() {
    return new Promise((resolve, reject) => {
      const child = (0, import_child_process.spawn)(this.command, this.args, this.options);
      let stdout = "";
      let stderr = "";
      child.stdout.on("data", (data) => {
        const text = data.toString("utf-8");
        stdout += text;
      });
      child.stderr.on("data", (data) => {
        const text = data.toString("utf-8");
        stderr += text;
      });
      child.on("close", (code) => {
        if (code === 0) {
          resolve(stdout);
        } else {
          reject(
            new Error(
              `Command '${this.command} ${this.args.join(
                " "
              )}' failed with error code: ${code}.

${stdout}

${stderr}`
            )
          );
        }
      });
    });
  }
};
