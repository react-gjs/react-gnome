import { spawn } from "child_process";

export class Command {
  constructor(
    private command: string,
    private args: string[],
    private options: { cwd?: string }
  ) {}

  public async run(): Promise<string> {
    return new Promise((resolve, reject) => {
      const child = spawn(this.command, this.args, this.options);

      let stdout = "";
      let stderr = "";

      child.stdout.on("data", (data) => {
        stdout += data;
      });

      child.stderr.on("data", (data) => {
        stderr += data;
      });

      child.on("error", () => {
        reject(new Error(stderr));
      });

      child.on("close", (code) => {
        if (code === 0) {
          resolve(stdout);
        } else {
          reject(new Error(stderr));
        }
      });
    });
  }
}
