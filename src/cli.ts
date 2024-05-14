import { configure } from "clify.js";
import { BuildProgram } from "./programs/build-program";
import { BundleProgram } from "./programs/bundle-program";
import { InitProgram } from "./programs/init-program";
import { StartProgram } from "./programs/start-program";

const program = configure((main) => {
  main.setName("react-gnome");
  main.setDescription("Build GTK apps with React.");

  main.command("bundle", (cmd) => {
    cmd.setDescription(
      "Create a bundled js file, without the tarball or meson configuration. This is useful if you want to manage the build process yourself.",
    );

    const bundle = new BundleProgram(cmd);

    return () => bundle.run();
  });

  main.command("build", (cmd) => {
    cmd.setDescription(
      "Create a tarball and meson configuration that's ready to be installed.",
    );

    const build = new BuildProgram(cmd);

    return () => build.run();
  });

  main.command("start", (cmd) => {
    cmd.setDescription("Build and run the app immediately.");

    const start = new StartProgram(cmd);

    return () => start.run();
  });

  main.command("init", (cmd) => {
    cmd.setDescription(
      "Initialize a new project with the necessary files and scripts.",
    );

    const init = new InitProgram(cmd);

    return () => init.run();
  });
});

/**
 * Invokes the CLI program.
 * 
 * if `command` or `args` are not provided, `process.argv` will be used.
 */
export async function start(
  command?: string,
  args?: Record<string, any>,
) {
  program.run(command, args);
}

export { BuildProgram, BundleProgram, InitProgram, StartProgram };

