import esbuild from "esbuild";
import path from "path";
import * as url from "url";

// @ts-expect-error
const __dirname = url.fileURLToPath(new URL(".", import.meta.url));

// First argument

async function main() {
  try {
    if (!process.argv[2]) throw new Error("No input file specified");
    if (!process.argv[3]) throw new Error("No output file specified");

    const inputFile = path.resolve(process.cwd(), process.argv[2]);
    const outputFile = path.resolve(process.cwd(), process.argv[3]);

    let mockMap: Record<string, string> = {};

    const loadSetup = async (filepath: string) => {
      const setupFile = path.resolve(process.cwd(), filepath);

      const setup = (await import(setupFile)).default;

      if (
        setup &&
        typeof setup === "object" &&
        "mocks" in setup &&
        setup.mocks &&
        typeof setup.mocks === "object"
      ) {
        Object.assign(mockMap, setup.mocks);
      }
    };

    if (process.argv[4]) {
      await loadSetup(process.argv[4]);
    }

    if (process.argv[5]) {
      await loadSetup(process.argv[5]);
    }

    await esbuild.build({
      entryPoints: [inputFile],
      bundle: true,
      define: {
        __dirname: JSON.stringify(path.dirname(inputFile)),
        __filename: JSON.stringify(inputFile),
      },
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

            if (Object.keys(mockMap).length > 0) {
              build.onResolve({ filter: /.*/ }, (args) => {
                if (mockMap![args.path]) {
                  return {
                    path: mockMap![args.path],
                  };
                }
              });
            }
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
