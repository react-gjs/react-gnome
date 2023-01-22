const { build } = require("@ncpa0cpl/nodepack");
const esbuild = require("esbuild");
const path = require("path");

const p = (loc) => path.resolve(__dirname, "..", loc);

async function main() {
  try {
    await build({
      target: "ESNext",
      srcDir: p("gest/src"),
      outDir: p("gest/dist"),
      tsConfig: p("gest/tsconfig.json"),
      formats: ["esm"],
      exclude: /.*\.d\.ts$/,
    });

    await esbuild.build({
      target: "ESNext",
      entryPoints: [p("node_modules/termx-markup/dist/esm/index.mjs")],
      outfile: p("gest/dist/esm/termx-markup.mjs"),
      bundle: true,
      format: "esm",
    });
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

main();
