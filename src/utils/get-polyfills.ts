import esbuild from "esbuild";
import path from "path";
import { getDirPath } from "../get-dirpath/get-dirpath";
import type { Program } from "../programs/base";

export type Polyfills = {
  bundle: string;
  requirements: [string, string | undefined][];
};

export const getGlobalPolyfills = (program: Program): Promise<Polyfills> => {
  const polyfills = { ...program.config.polyfills };

  if (polyfills?.XMLHttpRequest) {
    polyfills.URL = true;
  }

  if (polyfills?.URL || polyfills.node?.querystring) {
    polyfills.Buffer = true;
  }

  const polyFilepaths: string[] = [];

  if (polyfills?.Buffer) {
    polyFilepaths.push("./polyfills/esm/buffer.mjs");
  }

  if (polyfills?.URL) {
    polyFilepaths.push("./polyfills/esm/url.mjs");
  }

  if (polyfills?.fetch) {
    polyFilepaths.push("./polyfills/esm/fetch.mjs");
  }

  if (polyfills?.Blob) {
    polyFilepaths.push("./polyfills/esm/blob.mjs");
  }

  if (polyfills?.FormData) {
    polyFilepaths.push("./polyfills/esm/form-data.mjs");
  }

  if (polyfills?.XMLHttpRequest) {
    polyFilepaths.push("./polyfills/esm/xml-http-request.mjs");
  }

  if (polyfills?.base64) {
    polyFilepaths.push("./polyfills/esm/base64.mjs");
  }

  if (polyfills?.AbortController) {
    polyFilepaths.push("./polyfills/esm/abort-controller.mjs");
  }

  if (polyfills?.WebSocket) {
    polyFilepaths.push("./polyfills/esm/websocket.mjs");
  }

  if (polyfills?.queueMicrotask) {
    polyFilepaths.push("./polyfills/esm/queue-microtask.mjs");
  }

  const customPolyfills: string[] = [];

  if (program.config.customPolyfills) {
    const rootPath = getDirPath();
    for (const customPoly of program.config.customPolyfills) {
      // polyfills with an import name are handled by the
      // `importPolyfillsPlugin`
      if (!customPoly.importName) {
        const base = path.relative(rootPath, program.cwd);
        customPolyfills.push(path.join(base, customPoly.filepath));
      }
    }
  }

  return buildPolyfillsBundle(polyFilepaths, customPolyfills);
};

async function buildPolyfillsBundle(
  polyfillsPaths: string[],
  customPolyfills: string[],
): Promise<Polyfills> {
  const rootPath = getDirPath();
  const index = /* js */ `
import { registerPolyfills } from "./polyfills/esm/shared/polyfill-global.mjs";
${polyfillsPaths.map((p) => /* js */ `import "${p}";`).join("\n")}
${
    customPolyfills
      .map((p, i) => /* js */ `import p${i} from "${p}";`)
      .join("\n")
  }
${
    customPolyfills
      .map(
        (_, i) => /* js */ `
const p${i}keys = Object.keys(p${i});
registerPolyfills(...p${i}keys)(() => {
  return p${i};
})
`,
      )
      .join("\n")
  }
`.trim();

  const requirements: [string, string | undefined][] = [];

  const result = await esbuild.build({
    stdin: {
      contents: index,
      loader: "ts",
      resolveDir: rootPath,
      sourcefile: "polyfills.ts",
    },
    bundle: true,
    write: false,
    format: "iife",
    target: "esnext",
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
      "Failed to build the bundle containing the polyfills code.",
    );
  }

  const [out] = result.outputFiles;

  return {
    bundle: out!.text,
    requirements,
  };
}
