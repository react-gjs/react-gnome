import type { Program } from "../programs/base";

export type Polyfills = {
  bundle: string;
  requirements: [string, string | undefined][];
};

export const getGlobalPolyfillsInmportPaths = (
  program: Program,
): string[] => {
  const polyfills = { ...program.config.polyfills };

  if (polyfills?.XMLHttpRequest) {
    polyfills.URL = true;
  }

  if (polyfills?.URL || polyfills.node?.querystring) {
    polyfills.Buffer = true;
  }

  const polyFilepaths: string[] = [];

  if (polyfills?.Buffer) {
    polyFilepaths.push("@reactgjs/react-gtk/polyfills/esm/buffer.mjs");
  }

  if (polyfills?.URL) {
    polyFilepaths.push("@reactgjs/react-gtk/polyfills/esm/url.mjs");
  }

  if (polyfills?.fetch) {
    polyFilepaths.push("@reactgjs/react-gtk/polyfills/esm/fetch.mjs");
  }

  if (polyfills?.Blob) {
    polyFilepaths.push("@reactgjs/react-gtk/polyfills/esm/blob.mjs");
  }

  if (polyfills?.FormData) {
    polyFilepaths.push("@reactgjs/react-gtk/polyfills/esm/form-data.mjs");
  }

  if (polyfills?.XMLHttpRequest) {
    polyFilepaths.push(
      "@reactgjs/react-gtk/polyfills/esm/xml-http-request.mjs",
    );
  }

  if (polyfills?.base64) {
    polyFilepaths.push("@reactgjs/react-gtk/polyfills/esm/base64.mjs");
  }

  if (polyfills?.AbortController) {
    polyFilepaths.push(
      "@reactgjs/react-gtk/polyfills/esm/abort-controller.mjs",
    );
  }

  if (polyfills?.WebSocket) {
    polyFilepaths.push("@reactgjs/react-gtk/polyfills/esm/websocket.mjs");
  }

  if (polyfills?.queueMicrotask) {
    polyFilepaths.push("@reactgjs/react-gtk/polyfills/esm/queue-microtask.mjs");
  }

  return polyFilepaths;
};

export const getCustomPolyfillsImports = (program: Program) => {
  const codeLines: string[] = [];

  if (program.config.customPolyfills) {
    for (const [idx, customPoly] of program.config.customPolyfills.entries()) {
      // polyfills with an import name are handled by the
      // `importPolyfillsPlugin`
      if (!customPoly.importName) {
        codeLines.push(
          `import cpolly_${idx} from ${JSON.stringify(customPoly.filepath)};`,
        );
        codeLines.push(`registerPolyfills.fromModule(cpolly_${idx});`);
      }
    }
  }

  return codeLines;
};
