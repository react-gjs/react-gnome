import { Argument } from "clify.js";
import fs from "fs";
import path from "path";
import { html, Output } from "termx-markup";
import { getProjectConfigFile } from "../init-project/config-file";
import { getEntryFile } from "../init-project/entry-file";

const PackageManagerArg = Argument.define({
  flagChar: "-p",
  keyword: "--package-manager",
  description: "The package manager to use for scripts.",
  dataType: "string",
});

export class InitProgram {
  packageManager = new PackageManagerArg();

  run() {
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
      html`<span
        >Creating entrypoint file:<s />
        <span color="white">
          ./${path.relative(projectDir, entryFilePath)}
        </span>
      </span>`
    );
    fs.writeFileSync(entryFilePath, entryFileContent);

    Output.print(
      html`<span>
        Creating config file:<s />
        <span color="white">
          ./${path.relative(projectDir, configFilePath)}
        </span>
      </span>`
    );
    fs.writeFileSync(configFilePath, configFileContent);

    // add scripts to the package.json

    Output.print(
      html`<span>
        Updating scripts in:<s /><span color="white">./package.json</span></span
      >`
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

    Output.print(html` <span color="green">Done.</span> `);
  }
}
