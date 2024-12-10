# Polyfills

React Gnome has a set of polyfills that can be enabled in the config file.

## Global Polyfills

All of the following global functions/namespaces are not present in GJS environments, but can be added by enabling the polyfills in the config file.

1. [AbortController](https://developer.mozilla.org/en-US/docs/Web/API/AbortController)
2. [Blob](https://developer.mozilla.org/en-US/docs/Web/API/Blob)
3. [Buffer](https://nodejs.org/api/buffer.html)
4. [FormData](https://developer.mozilla.org/en-US/docs/Web/API/FormData)
5. [XMLHttpRequest](https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest)
6. [atob & btoa](https://developer.mozilla.org/en-US/docs/Web/API/Window/atob) (called `base64` in config)
7. [fetch](https://developer.mozilla.org/en-US/docs/Web/API/Window/fetch)
8. [WebSocket](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket)

## Node Polyfills

None of the Node.js core modules are available in GJS environments, but can be added by enabling the polyfills in the config file.

1. [node:path](https://nodejs.org/api/path.html)
2. [node:fs](https://nodejs.org/api/fs.html)
3. [node:querystring](https://nodejs.org/api/querystring.html)
4. [node:os](https://nodejs.org/api/os.html)

### Config Example


```tsx
import type { BuildConfig } from "@reactgjs/react-gnome";

export default () => {
  const config: BuildConfig = {
    applicationName: "Example App",
    applicationVersion: "1.0.0",
    entrypoint: "./src/start.tsx",
    outDir: "./dist",
    polyfills: {
      AbortController: true,
      Blob: true,
      Buffer: true,
      FormData: true,
      URL: true,
      WebSocket: true,
      XMLHttpRequest: true,
      base64: true,
      fetch: true,
      node: {
        fs: true,
        os: true,
        path: true,
        querystring: true,
      },
    },
  };

  return config;
};
```

## Custom Polyfills

If a node module or a global you need is not available among the polyfills provided by React Gnome,
you can simply add them through the `customPolyfills` option in the config file.

```tsx
import type { BuildConfig } from "@reactgjs/react-gnome";

export default () => {
  const config: BuildConfig = {
    applicationName: "Example App",
    applicationVersion: "1.0.0",
    entrypoint: "./src/start.tsx",
    outDir: "./dist",
    customPolyfills: [
      {
        filepath: "./src/polyfills/utils.ts",
        importName: "node:util",
      },
    ],
  };

  return config;
};
```

The above config will polyfill all uses of the `node:util` imports with whatever is exported from the `./src/polyfills/utils.ts` file.
If the importName is not specified, all the exports from the file will be added to the global scope.
