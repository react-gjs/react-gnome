import { configure } from "clify.js";
import { BuildProgram } from "./programs/build-program";
import { PackageProgram } from "./programs/package-program";
import { StartProgram } from "./programs/start-program";

/** Invokes the CLI program that builds the app. */
export async function build() {
  configure((main) => {
    main.setDisplayName("react-gnome");
    main.setDescription("Build GTK apps with React.");

    const buildCommand = main.addSubCommand("build", () => new BuildProgram());
    const startCommand = main.addSubCommand("start", () => new StartProgram());
    const packageCommand = main.addSubCommand(
      "create-package",
      () => new PackageProgram()
    );

    buildCommand.setDescription("Build and bundle the app into a single file.");
    startCommand.setDescription("Build, bundle and open the app.");
    packageCommand.setDescription(
      "Build, bundle and create a full package for the app."
    );
  });
}

export { BuildProgram, PackageProgram, StartProgram };
