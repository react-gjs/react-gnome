/**
 * Settings for environment variables injected into the generated bundle.
 */
export declare type EnvVars = {
  /**
   * If system vars are enabled, an array of strings or a Regex of environment variables that can be included in the generated bundle.
   * 
   * By default allows all.
   */
  allow?: Array<string> | InstanceType<typeof RegExp>;
  /**
   * A dictionary of environment variables and values to use if the variable is not set in the system environment or .env file.
   */
  defaults?: Record<string | number, string | number | boolean>;
  /**
   * If system vars are enabled, an array of strings or a Regex of environment variables that should not be included in the generated bundle.
   * 
   * By default disallows none.
   */
  disallow?: Array<string> | InstanceType<typeof RegExp>;
  /**
   * The path to the .env file. Should be a relative path from the project root. If this option is specified but the file does not exist, build will fail with an error.
   * 
   * Default is `.env`.
   */
  envFilePath?: string;
  /**
   * Whether the system environment variables should be included in the generated bundle.
   * 
   * By default is always disabled.
   */
  systemVars?: boolean;
};


export declare type EsbuildPlugin = {
  name: string;
  setup: (...args: any[]) => unknown;
};

/**
 * Esbuild plugins.
 * Plugins can only be added via a JavaScript config file. If you are using a JSON config file and want to add a plugin, you will need to create a `react-gnome.config.js` file and use that instead.
 */
export declare type EsbuildPlugins = Array<EsbuildPlugin>;

/**
 * An array of packages that should be excluded from the bundle.
 * This is useful for packages that are already installed on the system and should not be bundled.
 */
export declare type ExternalPackages = Array<string>;

/**
 * The versions of the builtin libraries from the `gi://` namespace, that should be used in the generated bundle.
 */
export declare type GiVersions = {
  Gtk?: "3.0";
  Gdk?: string;
  Gio?: string;
  GLib?: string;
  GObject?: string;
  Pango?: string;
  Atk?: string;
  Cairo?: string;
  GModule?: string;
  GdkPixbuf?: string;
  Cally?: string;
  Clutter?: string;
  ClutterX11?: string;
  Cogl?: string;
  Graphene?: string;
  Gst?: string;
  HarfBuzz?: string;
  Soup?: string;
  cairo?: string;
  xlib?: string;
};

/**
 * Polyfill options for some specific Node.js builtin packages.
 */
export declare type NodePolyfills = {
  /**
   * Whether the polyfill for the `path` and/or `node:path` package should be included in the generated bundle. When enabled imports of `path` and `node:path` will be replaced with the polyfill.
   */
  path?: boolean;
  /**
   * Whether the polyfill for the `fs`, `fs/promises`, `node:fs/promises`, and/or `node:fs` package should be included in the generated bundle. When enabled imports of `fs`, `fs/promises`, `node:fs/promises`, and `node:fs` will be replaced with the polyfill.
   */
  fs?: boolean;
  /**
   * Whether the polyfill for the `querystring` and/or `node:querystring` package should be included in the generated bundle. When enabled imports of `querystring` and `node:querystring` will be replaced with the polyfill.
   */
  querystring?: boolean;
  /**
   * Whether the polyfill for the `os` and/or `node:os` package should be included in the generated bundle. When enabled imports of `os` and `node:os` will be replaced with the polyfill.
   */
  os?: boolean;
};

/**
 * Polyfills that should be included in the generated bundle.
 */
export declare type Polyfills = {
  /**
   * Whether the polyfill for an `AbortController` should be included in the generated bundle. When enabled the `AbortController`, `AbortSignal` and `AbortError` classes will become available in the global scope.
   */
  AbortController?: boolean;
  /**
   * Whether the polyfill for a `Blob` should be included in the generated bundle. When enabled the `Blob` class will become available in the global scope.
   */
  Blob?: boolean;
  /**
   * Whether the polyfill for a `Buffer` should be included in the generated bundle. When enabled the `Buffer` class will become available in the global scope.
   */
  Buffer?: boolean;
  /**
   * Whether the polyfill for a `FormData` should be included in the generated bundle. When enabled the `FormData` class will become available in the global scope.
   */
  FormData?: boolean;
  /**
   * Whether the polyfill for a `URL` should be included in the generated bundle. When enabled the `URL` class will become available in the global scope.
   */
  URL?: boolean;
  /**
   * Whether the polyfill for a `XMLHttpRequest` should be included in the generated bundle. When enabled the `XMLHttpRequest` class will become available in the global scope.
   */
  XMLHttpRequest?: boolean;
  /**
   * Whether the polyfill for `atob()` and `btoa()` functions should be included in the generated bundle. When enabled the `atob()` and `btoa()` will become available in the global scope.
   */
  base64?: boolean;
  /**
   * Whether the polyfill for a `fetch()` function should be included in the generated bundle. When enabled the `fetch()` function will become available in the global scope.
   */
  fetch?: boolean;
  /**
   * Polyfill options for some specific Node.js builtin packages.
   */
  node?: NodePolyfills;
};


export declare type Config = {
  /**
   * The name of the application. It is recommended for this name to only include letters, numbers, dashes and floors. Additional it is invalid to have the first or last letter of the name to be anything else than a letter or a number.
   */
  applicationName: string;
  /**
   * The version of the application.
   * This is used to generate the bundle.
   */
  applicationVersion: string;
  /**
   * The prefix of the application ID. For example `com.example`. This value will be a part of the app id. It must only contain letters, dashes and dots.
   * 
   * Default is `org.gnome`.
   */
  applicationPrefix?: string;
  /**
   * The entrypoint file of the application. Should be a relative path from the project root.
   */
  entrypoint: string;
  /**
   * Settings for environment variables injected into the generated bundle.
   */
  envVars?: EnvVars;
  /**
   * Esbuild plugins.
   * Plugins can only be added via a JavaScript config file. If you are using a JSON config file and want to add a plugin, you will need to create a `react-gnome.config.js` file and use that instead.
   */
  esbuildPlugins?: EsbuildPlugins;
  /**
   * An array of packages that should be excluded from the bundle.
   * This is useful for packages that are already installed on the system and should not be bundled.
   */
  externalPackages?: ExternalPackages;
  /**
   * The friendly name of the application.
   * This is the name you'd want to display to the user.
   *  If not specified, the application name will be used.
   */
  friendlyName?: string;
  /**
   * The versions of the builtin libraries from the `gi://` namespace, that should be used in the generated bundle.
   */
  giVersions?: GiVersions;
  /**
   * The license of the application.
   * 
   * Default is `GPL-2.0`.
   */
  license?: string;
  /**
   * Whether the generated bundle should be minified.
   * This is useful for production builds.
   * 
   * By default is enabled in `production` mode and disabled in `development` mode.
   */
  minify?: boolean;
  /**
   * The output directory for the generated bundle. Should be a relative path from the project root.
   */
  outDir: string;
  /**
   * Polyfills that should be included in the generated bundle.
   */
  polyfills?: Polyfills;
  /**
   * Custom polyfills that should be included in the generated bundle.
   * 
   * This is useful for polyfills that are not included in the polyfills provided by react-gnome.
   */
  customPolyfills?: Array<{
    /**
     * Path to the file containing the polyfill.
     */
    filepath: string;
    /**
     * The name of the import that should be replaced with the polyfill (for example `node:fs`, `path`, `os`, etc.). If not specified, each exported member of polyfill will be injected into the global scope.
     */
    importName?: string;
  }>;
  /**
   * Whether unused code should be removed from the bundle.
   * This is useful for production builds.
   * 
   * By default is enabled in `production` mode and disabled in `development` mode.
   */
  treeShake?: boolean;
};
