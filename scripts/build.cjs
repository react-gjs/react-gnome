const { build } = require("@ncpa0cpl/nodepack");
const { toJsonSchema } = require("dilswer");
const path = require("path");
const fs = require("fs/promises");

const p = (loc) => path.resolve(__dirname, "..", loc);

async function main() {
  try {
    await build({
      target: "es6",
      srcDir: p("src"),
      outDir: p("dist"),
      tsConfig: p("tsconfig.json"),
      formats: ["cjs", "esm", "legacy"],
      declarations: true,
      isomorphicImports: {
        "./config/eval-js-config/eval-js-config.ts": {
          js: "./config/eval-js-config/eval-js-config.cjs.ts",
          cjs: "./config/eval-js-config/eval-js-config.cjs.ts",
          mjs: "./config/eval-js-config/eval-js-config.mjs.ts",
        },
      },
    });

    const { ConfigSchema } = require(p("dist/cjs/config/config-schema.cjs"));

    const configJsonSchema = toJsonSchema(ConfigSchema, {
      additionalProperties: false,
    });

    await fs.writeFile(
      p("dist/config-schema.json"),
      JSON.stringify(configJsonSchema, null, 2)
    );
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

main();
