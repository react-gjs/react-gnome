import { configure } from "clify.js";
import { BuildProgram } from "./programs/build-program";
import { BundleProgram } from "./programs/bundle-program";
import { InitProgram } from "./programs/init-program";
import { StartProgram } from "./programs/start-program";

/**
 * Invokes the CLI program that builds the app.
 */
export async function build() {
  const program = configure((main) => {
    main.setName("react-gnome");
    main.setDescription("Build GTK apps with React.");

    main.command("bundle", (cmd) => {
      cmd.setDescription(
        "Create a bundled js file, without the tarball or meson configuration. This is useful if you want to manage the build process yourself.",
      );

      const program = new BundleProgram(cmd);

      return () => program.run();
    });

    main.command("build", (cmd) => {
      cmd.setDescription(
        "Create a tarball and meson configuration that's ready to be installed.",
      );

      const program = new BuildProgram(cmd);

      return () => program.run();
    });

    main.command("start", (cmd) => {
      cmd.setDescription("Build and run the app immediately.");

      const program = new StartProgram(cmd);

      return () => program.run();
    });

    main.command("init", (cmd) => {
      cmd.setDescription(
        "Initialize a new project with the necessary files and scripts.",
      );

      const program = new InitProgram(cmd);

      return () => program.run();
    });
  });

  program.run();
}

export { BuildProgram, BundleProgram, StartProgram };

