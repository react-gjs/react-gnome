import { exec } from "child_process";
import { CommandInitPhase, defineOption } from "clify.js";
import fsbase from "fs";
import fs from "fs/promises";
import path from "path";
import { html, Output } from "termx-markup";
import { getJsProjectConfigFile } from "../init-project/config-file-js";
import { getTsProjectConfigFile } from "../init-project/config-file-ts";
import { getJsEntryFile } from "../init-project/entry-file-js";
import { getTsEntryFile } from "../init-project/entry-file-ts";
import { getTsConfig } from "../init-project/tsconfig-file";

const ForceTypescriptArg = defineOption({
  char: "t",
  name: "typescript",
  description:
    "Initiate project with typescript. By default this will be enabled automatically if a tsconfig.json file is detected.",
  type: "boolean",
});

export class InitProgram {
  readonly type = "init";

  forceTypescript;
  packageManager!: "npm" | "yarn" | "pnpm" | "bun";
  projectDir = process.cwd();

  constructor(init: CommandInitPhase) {
    this.forceTypescript = init.option(ForceTypescriptArg);
  }

  private detectPackageManager(projectFiles?: string[]) {
    if (this.packageManager) {
      return this.packageManager;
    }

    if (projectFiles == null) {
      projectFiles = fsbase.readdirSync(this.projectDir);
    }

    if (projectFiles.includes("yarn.lock")) {
      this.packageManager = "yarn";
    } else if (projectFiles.includes("package-lock.json")) {
      this.packageManager = "npm";
    } else if (projectFiles.includes("pnpm-lock.yaml")) {
      this.packageManager = "pnpm";
    } else if (projectFiles.includes("bun.lockb")) {
      this.packageManager = "bun";
    } else {
      this.packageManager = "npm";
    }

    return this.packageManager;
  }

  private async createFiles(projectDir: string, useTypescript: boolean) {
    // if src dir does not exist, create it
    const srcDir = path.resolve(projectDir, "src");
    if (!fsbase.existsSync(srcDir)) {
      await fs.mkdir(srcDir);
    }

    const entryFilePath = path.resolve(
      projectDir,
      "src",
      useTypescript ? "start.tsx" : "start.jsx",
    );
    if (!fsbase.existsSync(entryFilePath)) {
      const entryFileContent = useTypescript
        ? getTsEntryFile()
        : getJsEntryFile();

      Output.print(
        html`<span>
          Creating entrypoint file:
          <span color="white">
            ./${path.relative(projectDir, entryFilePath)}
          </span>
        </span>`,
      );

      await fs.writeFile(entryFilePath, entryFileContent);
    }

    const configFilePath = path.resolve(
      projectDir,
      useTypescript ? "react-gnome.config.ts" : "react-gnome.config.mjs",
    );
    if (!fsbase.existsSync(configFilePath)) {
      const configFileContent = useTypescript
        ? getTsProjectConfigFile()
        : getJsProjectConfigFile();

      Output.print(
        html`<span>
        Creating config file:
          <span color="white">
            ./${path.relative(projectDir, configFilePath)}
          </span>
        </span>`,
      );

      await fs.writeFile(configFilePath, configFileContent);
    }

    if (useTypescript) {
      const tsconfigPath = path.resolve(projectDir, "tsconfig.json");
      if (!fsbase.existsSync(tsconfigPath)) {
        const fileContent = getTsConfig();

        Output.print(
          html`<span>
          Creating tsconfig file:
            <span color="white">
              ./${path.relative(projectDir, tsconfigPath)}
            </span>
          </span>`,
        );

        await fs.writeFile(tsconfigPath, fileContent);
      }
    }
  }

  private async updatePackageJson(
    packageJson: Record<string, any>,
    filepath: string,
  ) {
    Output.print(
      html`<span>
        Updating scripts in:
        <span color="white">./package.json</span>
      </span>`,
    );

    const scripts = packageJson.scripts ?? {};

    scripts.build = `react-gnome build`;
    scripts.bundle = `react-gnome bundle`;
    scripts.start = `react-gnome start -m development -w`;
    scripts["install-pkg"] = "meson install -C ./dist/.build/_build";

    packageJson.type = "module";
    packageJson.scripts = scripts;

    await fs.writeFile(filepath, JSON.stringify(packageJson, null, 2));
  }

  private async installDependencies(
    packageJson: Record<string, any>,
    useTypescript: boolean,
  ) {
    const hasDep = (dep: string) => {
      return (
        (packageJson.dependencies && !!packageJson.dependencies[dep])
        || (packageJson.devDependencies && !!packageJson.devDependencies[dep])
      );
    };

    Output.print(html`<span>Installing dependencies...</span>`);

    const neededDeps = {
      dev: <string[]> [],
      prod: <string[]> [],
    };
    if (!hasDep("react")) {
      neededDeps.prod.push("react");
    }
    if (!hasDep("@reactgjs/renderer")) {
      neededDeps.prod.push("@reactgjs/renderer");
    }

    if (useTypescript) {
      if (!hasDep("typescript")) {
        neededDeps.dev.push("typescript");
      }
      if (!hasDep("@types/react")) {
        neededDeps.dev.push("@types/react");
      }
      if (!hasDep("ts-node")) {
        neededDeps.dev.push("ts-node");
      }
      if (!hasDep("gjs-esm-types")) {
        neededDeps.dev.push("gjs-esm-types");
      }
    }

    switch (this.detectPackageManager()) {
      case "yarn":
        await execute(`yarn add -D ${neededDeps.dev.join(" ")}`);
        await execute(`yarn add ${neededDeps.prod.join(" ")}`);
        break;
      case "pnpm":
        await execute(`pnpm add -D ${neededDeps.dev.join(" ")}`);
        await execute(`pnpm add ${neededDeps.prod.join(" ")}`);
        break;
      case "bun":
        await execute(`bun add -D ${neededDeps.dev.join(" ")}`);
        await execute(`bun add ${neededDeps.prod.join(" ")}`);
        break;
      case "npm":
        await execute(`npm install --save-dev ${neededDeps.dev.join(" ")}`);
        await execute(`npm install --save ${neededDeps.prod.join(" ")}`);
        break;
    }
  }

  async run() {
    Output.print(html` <span color="green">Initializing new project.</span> `);

    const projectDir = process.cwd();
    const projectFiles = await fs.readdir(projectDir);
    const useTypescript = this.forceTypescript.value
      ?? projectFiles.includes("tsconfig.json");
    this.detectPackageManager(projectFiles);

    await this.createFiles(projectDir, useTypescript);

    const packageJsonPath = path.resolve(projectDir, "package.json");
    let packageJson: any = {};

    if (fsbase.existsSync(packageJsonPath)) {
      packageJson = JSON.parse(await fs.readFile(packageJsonPath, "utf-8"));
    }

    await this.updatePackageJson(packageJson, packageJsonPath);

    await this.installDependencies(packageJson, useTypescript);

    Output.print(html` <span color="green">Done.</span> `);
  }
}

function execute(
  command: string,
): Promise<{ stdout: string; stderr: string; code: number | null }> {
  return new Promise((resolve) => {
    exec(command, (err, stdout, stderr) => {
      if (err) {
        resolve({ stdout, stderr, code: err.code ?? null });
      } else {
        resolve({ stdout, stderr, code: 0 });
      }
    });
  });
}
