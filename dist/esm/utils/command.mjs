// src/utils/command.ts
import { spawn } from "child_process";
var Command = class {
  constructor(command, args, options) {
    this.command = command;
    this.args = args;
    this.options = options;
  }
  async run() {
    return new Promise((resolve, reject) => {
      const child = spawn(this.command, this.args, this.options);
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
export {
  Command
};
