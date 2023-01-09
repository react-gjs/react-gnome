import { configure } from "clify.js";
import { BuildProgram } from "./programs/build-program";
import { BundleProgram } from "./programs/bundle-program";
import { StartProgram } from "./programs/start-program";

/** Invokes the CLI program that builds the app. */
export async function build() {
  configure((main) => {
    main.setDisplayName("react-gnome");
    main.setDescription("Build GTK apps with React.");

    const bundleCmd = main.addSubCommand("bundle", () => new BundleProgram());
    const buildCmd = main.addSubCommand("build", () => new BuildProgram());
    const startCmd = main.addSubCommand("start", () => new StartProgram());

    bundleCmd.setDescription(
      "Create a bundled js file, without the tarball or meson configuration. This is useful if you want to manage the build process yourself."
    );
    buildCmd.setDescription(
      "Create a tarball and meson configuration thats ready to be installed."
    );
    startCmd.setDescription("Build and run the app immediately after.");
  });
}

export { BundleProgram, BuildProgram, StartProgram };
