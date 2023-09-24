import { spawn } from "child_process";

export class Command {
  constructor(
    private command: string,
    private args: string[],
    private options: { cwd?: string },
  ) {}

  public async run(): Promise<string> {
    return new Promise((resolve, reject) => {
      const child = spawn(this.command, this.args, this.options);

      let stdout = "";
      let stderr = "";

      child.stdout.on("data", (data: Buffer) => {
        const text = data.toString("utf-8");
        stdout += text;
      });

      child.stderr.on("data", (data: Buffer) => {
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
                " ",
              )}' failed with error code: ${code}.\n\n${stdout}\n\n${stderr}`,
            ),
          );
        }
      });
    });
  }
}
