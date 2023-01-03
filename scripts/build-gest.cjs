const { build } = require("@ncpa0cpl/nodepack");
const path = require("path");

const p = (loc) => path.resolve(__dirname, "..", loc);

async function main() {
  try {
    await build({
      target: "es2020",
      srcDir: p("gest/src"),
      outDir: p("gest/dist"),
      tsConfig: p("gest/tsconfig.json"),
      formats: ["esm"],
    });
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

main();
