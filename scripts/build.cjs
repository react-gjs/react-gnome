const { build } = require("@ncpa0cpl/nodepack");
const { toJsonSchema, toTsType } = require("dilswer");
const path = require("path");
const fs = require("fs/promises");

const p = (loc) => path.resolve(__dirname, "..", loc);

async function main() {
  try {
    await Promise.all([
      // Build main package
      await build({
        target: "es2020",
        srcDir: p("src"),
        outDir: p("dist"),
        tsConfig: p("tsconfig.json"),
        formats: ["cjs", "esm", "legacy"],
        declarations: true,
        exclude: [/\/polyfills\//],
        isomorphicImports: {
          "./config/eval-js-config/eval-js-config.ts": {
            js: "./config/eval-js-config/eval-js-config.cjs.ts",
            cjs: "./config/eval-js-config/eval-js-config.cjs.ts",
            mjs: "./config/eval-js-config/eval-js-config.esm.ts",
          },
          "./get-dirpath/get-dirpath.ts": {
            js: "./get-dirpath/get-dirpath.cjs.ts",
            cjs: "./get-dirpath/get-dirpath.cjs.ts",
            mjs: "./get-dirpath/get-dirpath.esm.ts",
          },
        },
      }),
      // Build polyfill packages
      await build({
        target: "es2022",
        srcDir: p("src/polyfills"),
        outDir: p("polyfills"),
        tsConfig: p("tsconfig.json"),
        formats: ["esm"],
        exclude: [/\.d\.ts$/, /index.ts/],
      }),
    ]);

    const { ConfigSchema } = require(p("dist/cjs/config/config-schema.cjs"));

    const configJsonSchema = toJsonSchema(ConfigSchema, {
      additionalProperties: false,
      customParser: {
        Function() {
          return {
            title: "EsBuild Plugin Setup Function",
          };
        },
        Custom() {
          // EsBuild Plugin
          return {
            type: "object",
            properties: {
              name: { type: "string" },
            },
            additionalProperties: false,
          };
        },
      },
    });

    await fs.writeFile(
      p("dist/config-schema.json"),
      JSON.stringify(configJsonSchema, null, 2)
    );

    const configTsType = toTsType(ConfigSchema, {
      mode: "named-expanded",
      onDuplicateName: "rename",
    });

    await fs.writeFile(
      p("dist/types/config/config-type.d.ts"),
      configTsType.replace(/export type/g, "export declare type")
    );
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

main();
