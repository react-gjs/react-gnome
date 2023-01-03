import esbuild from "esbuild";
import path from "path";
import * as url from "url";

// @ts-expect-error
const __dirname = url.fileURLToPath(new URL(".", import.meta.url));

// First argument
const inputFile = process.argv[2];
const outputFile = process.argv[3];

async function main() {
  try {
    if (!inputFile) throw new Error("No input file specified");
    if (!outputFile) throw new Error("No output file specified");

    await esbuild.build({
      entryPoints: [inputFile],
      bundle: true,
      outfile: outputFile,
      format: "esm",
      minify: false,
      keepNames: true,
      sourcemap: true,
      plugins: [
        {
          name: "gest-import-replacer",
          setup(build) {
            build.onResolve({ filter: /gi:.*/ }, (args) => {
              return {
                external: true,
              };
            });

            build.onResolve({ filter: /^gest-globals$/ }, (args) => {
              return {
                path: path.resolve(__dirname, "./gest-globals.mjs"),
              };
            });
          },
        },
      ],
    });
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

main();
