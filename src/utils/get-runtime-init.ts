import dedent from "dedent";
import esbuild from "esbuild";
import fs from "fs";
import path from "path";
import { getDirPath } from "../get-dirpath/get-dirpath";
import { Program } from "../programs/base";

const ALLOWED_EXTENSIONS = [".ts", ".js", ".mjs", ".cjs"];

export function getRuntimeInit(program: Program) {
  const rootPath = getDirPath();
  const files = fs.readdirSync(path.join(rootPath, "runtime/esm"));
  const modules: string[] = [];
  for (const filename of files) {
    const ext = path.extname(filename);
    if (ALLOWED_EXTENSIONS.includes(ext)) {
      modules.push("./runtime/esm/" + filename);
    }
  }
  return buildInitBundle(modules, program);
}

async function buildInitBundle(scriptsFilepaths: string[], program: Program) {
  const rootPath = getDirPath();
  const modules = scriptsFilepaths.map((p, i) => ({
    path: p,
    name: `runtime_${i}`,
  }));
  const index =
    `${
      modules.map((m) => /* js */ `import * as ${m.name} from "${m.path}";`)
        .join("\n")
    }`.trim()
    + dedent`
      const modules = [${modules.map((m) => m.name).join(", ")}];
      for (const module of modules) {
        const entries = Object.entries(module);
        for (const [key, value] of entries) {
          if (key in globalThis) {
            continue;
          }
          Object.defineProperty(globalThis, key, {
            value: value,
            writable: false,
            configurable: false,
          });
        }
      }
    `;

  const requirements: [string, string | undefined][] = [];

  const result = await esbuild.build({
    stdin: {
      contents: index,
      loader: "ts",
      resolveDir: rootPath,
      sourcefile: "runtime.ts",
    },
    treeShaking: true,
    bundle: true,
    write: false,
    format: "iife",
    target: "esnext",
    define: {
      __MODE__: JSON.stringify(program.isDev ? "development" : "production"),
      __SOURCE_MAPS_ENABLED__: String(!!program.config.sourcemap),
    },
    plugins: [
      {
        name: "replace-gi-imports",
        setup(build) {
          build.onResolve({ filter: /^gi:\/\/.+/ }, (args) => {
            return {
              namespace: "gi",
              path: args.path.replace(/^gi:/, ""),
            };
          });

          build.onLoad({ namespace: "gi", filter: /.*/ }, (args) => {
            const name = args.path.replace(/^\/\//, "").replace(/\?.+/, "");
            const version = args.path.indexOf("?") !== -1
              ? args.path.slice(
                args.path.indexOf("?") + "version=".length + 1,
              )
              : undefined;
            requirements.push([name, version]);
            return {
              contents: /* js */ `export default ${name};`,
            };
          });
        },
      },
    ],
  });

  if (result.errors.length > 0) {
    throw new AggregateError(
      result.errors.map(e =>
        `[${e.pluginName}] ${e.text}${e.detail ? `\n${String(e.detail)}` : ""}${
          e.location
            ? `\n  ${e.location.file}:${e.location.line}`
            : ""
        }`
      ),
      "Failed to build the bundle containing the runtime injection code.",
    );
  }

  const [out] = result.outputFiles;

  return {
    bundle: out!.text,
    requirements,
  };
}
