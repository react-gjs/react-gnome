import type esbuild from "esbuild";

export const reactGtkPlugin = () => {
  return {
    name: "react-gtk-esbuild-plugin",
    setup(build: esbuild.PluginBuild) {
      build.onResolve({ filter: /.*/ }, (args) => {
        if (args.importer) {
          if (args.path.startsWith("gi://")) {
            return {
              external: true,
              path: args.path,
            };
          }
        }
      });

      //   build.onEnd((result) => {
      //     console.log(
      //       fs.readdirSync(path.dirname(build.initialOptions.outfile!))
      //     );
      //   });
    },
  };
};
