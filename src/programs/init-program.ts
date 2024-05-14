import { exec } from "child_process";
import { CommandInitPhase, defineOption } from "clify.js";
import fs from "fs";
import path from "path";
import { Output, html } from "termx-markup";
import { getProjectConfigFile } from "../init-project/config-file";
import { getEntryFile } from "../init-project/entry-file";

const PackageManagerArg = defineOption({
  char: "p",
  name: "package-manager",
  description: "The package manager to use for scripts.",
  type: "string",
});

export class InitProgram {
  readonly type = "init";

  packageManager;

  constructor(init: CommandInitPhase) {
    this.packageManager = init.option(PackageManagerArg);
  }

  async run() {
    Output.print(html` <span color="green">Initializing new project.</span> `);

    const projectDir = process.cwd();

    // create entry and config files
    const entryFileContent = getEntryFile();
    const configFileContent = getProjectConfigFile();

    const entryFilePath = path.resolve(projectDir, "src", "start.tsx");
    const configFilePath = path.resolve(projectDir, "react-gnome.config.mjs");

    // if src dir does not exist, create it
    const srcDir = path.resolve(projectDir, "src");
    if (!fs.existsSync(srcDir)) {
      fs.mkdirSync(srcDir);
    }

    Output.print(
      html`<span>
        Creating entrypoint file:
        <span color="white">
          ./${path.relative(projectDir, entryFilePath)}
        </span>
      </span>`,
    );
    fs.writeFileSync(entryFilePath, entryFileContent);

    Output.print(
      html`<span>
        Creating config file:
        <span color="white">
          ./${path.relative(projectDir, configFilePath)}
        </span>
      </span>`,
    );
    fs.writeFileSync(configFilePath, configFileContent);

    // add scripts to the package.json

    Output.print(
      html`<span>
        Updating scripts in:
        <span color="white">./package.json</span>
      </span>`,
    );
    const packageJsonPath = path.resolve(projectDir, "package.json");

    let packageJson: any = {};

    if (fs.existsSync(packageJsonPath)) {
      packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf-8"));
    }

    const scripts = packageJson.scripts ?? {};

    const pmRun = this.packageManager.value === "npm" ? "npm run" : "yarn";

    scripts.build = `${pmRun} react-gnome build`;
    scripts.bundle = `${pmRun} react-gnome bundle`;
    scripts.start = `${pmRun} react-gnome start -m development -w`;
    scripts["install-pkg"] = "meson install -C ./dist/.build/_build";

    packageJson.type = "module";
    packageJson.scripts = scripts;

    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));

    const hasDep = (dep: string) => {
      return (
        (packageJson.dependencies && !!packageJson.dependencies[dep])
        || (packageJson.devDependencies && !!packageJson.devDependencies[dep])
      );
    };

    // Install required dependencies

    Output.print(html`<span>Installing dependencies...</span>`);

    const neededDeps = {
      dev: <string[]>[],
      prod: <string[]>[],
    }
    if (!hasDep("react")) {
      neededDeps.prod.push("react");
    }
    if (!hasDep("@reactgjs/renderer")) {
      neededDeps.prod.push("@reactgjs/renderer");
    }

    const files = fs.readdirSync(projectDir);

    if (files.includes("tsconfig.json") || files.some(f => f.endsWith(".ts"))) {
      neededDeps.dev.push("typescript");
      neededDeps.dev.push("@types/react");
      neededDeps.dev.push("ts-node");
    }

    if (files.includes("yarn.lock")) {
      await execute(`yarn add -D ${neededDeps.dev.join(" ")}`);
      await execute(`yarn add ${neededDeps.prod.join(" ")}`);
    } else if (files.includes("package-lock.json")) {
      await execute(`npm install --save-dev ${neededDeps.dev.join(" ")}`);
      await execute(`npm install --save ${neededDeps.prod.join(" ")}`);
    } else if (files.includes("pnpm-lock.yaml")) {
      await execute(`pnpm add -D ${neededDeps.dev.join(" ")}`);
      await execute(`pnpm add ${neededDeps.prod.join(" ")}`);
    } else if (files.includes("bun.lockb")) {
      await execute(`bun add -D ${neededDeps.dev.join(" ")}`);
      await execute(`bun add ${neededDeps.prod.join(" ")}`);
    } else {
      Output.print(
        html`<span color="red">
          Could not detect your package manager. Skipping.
        </span>`,
      );
    }

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
