import { DataType, OptionalField } from "dilswer";

export const EsbuildPluginDataType = DataType.RecordOf({
  name: DataType.String,
  setup: DataType.Function,
}).setTitle("EsbuildPlugin");

const RegexDataType = DataType.InstanceOf(RegExp);

RegexDataType.setDescription(
  "A Regular expression. Only supported in JavaScript config files."
);

export const ConfigSchema = DataType.RecordOf({
  applicationName: DataType.String,
  applicationVersion: DataType.String,
  applicationPrefix: OptionalField(DataType.String),
  entrypoint: DataType.String,
  envVars: OptionalField(
    DataType.RecordOf({
      allow: OptionalField(
        DataType.OneOf(DataType.ArrayOf(DataType.String), RegexDataType)
      ),
      defaults: OptionalField(
        DataType.Dict(DataType.String, DataType.Number, DataType.Boolean)
      ),
      disallow: OptionalField(
        DataType.OneOf(DataType.ArrayOf(DataType.String), RegexDataType)
      ),
      envFilePath: OptionalField(DataType.String),
      systemVars: OptionalField(DataType.Boolean),
    })
  ),
  esbuildPlugins: OptionalField(DataType.ArrayOf(EsbuildPluginDataType)),
  externalPackages: OptionalField(DataType.ArrayOf(DataType.String)),
  friendlyName: OptionalField(DataType.String),
  giVersions: OptionalField(
    DataType.RecordOf({
      Gtk: OptionalField(DataType.Literal("3.0")),
      Gdk: OptionalField(DataType.String),
      Gio: OptionalField(DataType.String),
      GLib: OptionalField(DataType.String),
      GObject: OptionalField(DataType.String),
      Pango: OptionalField(DataType.String),
      Atk: OptionalField(DataType.String),
      Cairo: OptionalField(DataType.String),
      GModule: OptionalField(DataType.String),
      GdkPixbuf: OptionalField(DataType.String),
      Cally: OptionalField(DataType.String),
      Clutter: OptionalField(DataType.String),
      ClutterX11: OptionalField(DataType.String),
      Cogl: OptionalField(DataType.String),
      Graphene: OptionalField(DataType.String),
      Gst: OptionalField(DataType.String),
      HarfBuzz: OptionalField(DataType.String),
      Soup: OptionalField(DataType.Literal("2.4")),
      cairo: OptionalField(DataType.String),
      xlib: OptionalField(DataType.String),
    })
  ),
  license: OptionalField(DataType.String),
  minify: OptionalField(DataType.Boolean),
  outDir: DataType.String,
  polyfills: OptionalField(
    DataType.RecordOf({
      AbortController: OptionalField(DataType.Boolean),
      Blob: OptionalField(DataType.Boolean),
      Buffer: OptionalField(DataType.Boolean),
      FormData: OptionalField(DataType.Boolean),
      URL: OptionalField(DataType.Boolean),
      XMLHttpRequest: OptionalField(DataType.Boolean),
      base64: OptionalField(DataType.Boolean),
      fetch: OptionalField(DataType.Boolean),
      WebSocket: OptionalField(DataType.Boolean),
      node: OptionalField(
        DataType.RecordOf({
          path: OptionalField(DataType.Boolean),
          fs: OptionalField(DataType.Boolean),
          querystring: OptionalField(DataType.Boolean),
          os: OptionalField(DataType.Boolean),
        })
      ),
    })
  ),
  customPolyfills: OptionalField(
    DataType.ArrayOf(
      DataType.RecordOf({
        filepath: DataType.String,
        importName: OptionalField(DataType.String),
      })
    )
  ),
  treeShake: OptionalField(DataType.Boolean),
});

ConfigSchema.setTitle("Config");
ConfigSchema.recordOf.envVars.type.setTitle("EnvVars");
ConfigSchema.recordOf.esbuildPlugins.type.setTitle("EsbuildPlugins");
ConfigSchema.recordOf.externalPackages.type.setTitle("ExternalPackages");
ConfigSchema.recordOf.giVersions.type.setTitle("GiVersions");
ConfigSchema.recordOf.polyfills.type.setTitle("Polyfills");
ConfigSchema.recordOf.polyfills.type.recordOf.node.type.setTitle(
  "NodePolyfills"
);

ConfigSchema.recordOf.applicationName.setDescription(
  "The name of the application. It is recommended for this name to only include letters, numbers, dashes and floors. Additional it is invalid to have the first or last letter of the name to be anything else than a letter or a number."
);

ConfigSchema.recordOf.applicationVersion.setDescription(
  "The version of the application.\nThis is used to generate the bundle."
);

ConfigSchema.recordOf.applicationPrefix.type.setDescription(
  "The prefix of the application ID. For example `com.example`. This value will be a part of the app id. It must only contain letters, dashes and dots.\n\nDefault is `org.gnome`."
);

ConfigSchema.recordOf.entrypoint.setDescription(
  "The entrypoint file of the application. Should be a relative path from the project root."
);

ConfigSchema.recordOf.outDir.setDescription(
  "The output directory for the generated bundle. Should be a relative path from the project root."
);

ConfigSchema.recordOf.externalPackages.type.setDescription(
  "An array of packages that should be excluded from the bundle.\nThis is useful for packages that are already installed on the system and should not be bundled."
);

ConfigSchema.recordOf.minify.type.setDescription(
  "Whether the generated bundle should be minified.\nThis is useful for production builds.\n\nBy default is enabled in `production` mode and disabled in `development` mode."
);

ConfigSchema.recordOf.treeShake.type.setDescription(
  "Whether unused code should be removed from the bundle.\nThis is useful for production builds.\n\nBy default is enabled in `production` mode and disabled in `development` mode."
);

ConfigSchema.recordOf.esbuildPlugins.type.setDescription(
  "Esbuild plugins.\nPlugins can only be added via a JavaScript config file. If you are using a JSON config file and want to add a plugin, you will need to create a `react-gnome.config.js` file and use that instead."
);

ConfigSchema.recordOf.giVersions.type.setDescription(
  "The versions of the builtin libraries from the `gi://` namespace, that should be used in the generated bundle."
);

ConfigSchema.recordOf.envVars.type.setDescription(
  "Settings for environment variables injected into the generated bundle."
);

ConfigSchema.recordOf.envVars.type.recordOf.systemVars.type.setDescription(
  "Whether the system environment variables should be included in the generated bundle.\n\nBy default is always disabled."
);

ConfigSchema.recordOf.envVars.type.recordOf.allow.type.setDescription(
  "If system vars are enabled, an array of strings or a Regex of environment variables that can be included in the generated bundle.\n\nBy default allows all."
);

ConfigSchema.recordOf.envVars.type.recordOf.disallow.type.setDescription(
  "If system vars are enabled, an array of strings or a Regex of environment variables that should not be included in the generated bundle.\n\nBy default disallows none."
);

ConfigSchema.recordOf.envVars.type.recordOf.defaults.type.setDescription(
  "A dictionary of environment variables and values to use if the variable is not set in the system environment or .env file."
);

ConfigSchema.recordOf.envVars.type.recordOf.envFilePath.type.setDescription(
  "The path to the .env file. Should be a relative path from the project root. If this option is specified but the file does not exist, build will fail with an error.\n\nDefault is `.env`."
);

ConfigSchema.recordOf.friendlyName.type.setDescription(
  "The friendly name of the application.\nThis is the name you'd want to display to the user.\n If not specified, the application name will be used."
);

ConfigSchema.recordOf.license.type.setDescription(
  "The license of the application.\n\nDefault is `GPL-2.0`."
);

const polyfills = ConfigSchema.recordOf.polyfills.type;

polyfills.setDescription(
  "Polyfills that should be included in the generated bundle."
);

polyfills.recordOf.AbortController.type.setDescription(
  "Whether the polyfill for an `AbortController` should be included in the generated bundle. When enabled the `AbortController`, `AbortSignal` and `AbortError` classes will become available in the global scope."
);

polyfills.recordOf.Blob.type.setDescription(
  "Whether the polyfill for a `Blob` should be included in the generated bundle. When enabled the `Blob` class will become available in the global scope."
);

polyfills.recordOf.Buffer.type.setDescription(
  "Whether the polyfill for a `Buffer` should be included in the generated bundle. When enabled the `Buffer` class will become available in the global scope."
);

polyfills.recordOf.FormData.type.setDescription(
  "Whether the polyfill for a `FormData` should be included in the generated bundle. When enabled the `FormData` class will become available in the global scope."
);

polyfills.recordOf.URL.type.setDescription(
  "Whether the polyfill for a `URL` should be included in the generated bundle. When enabled the `URL` class will become available in the global scope."
);

polyfills.recordOf.XMLHttpRequest.type.setDescription(
  "Whether the polyfill for a `XMLHttpRequest` should be included in the generated bundle. When enabled the `XMLHttpRequest` class will become available in the global scope."
);

polyfills.recordOf.base64.type.setDescription(
  "Whether the polyfill for `atob()` and `btoa()` functions should be included in the generated bundle. When enabled the `atob()` and `btoa()` will become available in the global scope."
);

polyfills.recordOf.fetch.type.setDescription(
  "Whether the polyfill for a `fetch()` function should be included in the generated bundle. When enabled the `fetch()` function will become available in the global scope."
);

polyfills.recordOf.WebSocket.type.setDescription(
  "Whether the polyfill for a `WebSocket` should be included in the generated bundle. When enabled the `WebSocket` class will become available in the global scope."
);

polyfills.recordOf.node.type.setDescription(
  "Polyfill options for some specific Node.js builtin packages."
);

polyfills.recordOf.node.type.recordOf.path.type.setDescription(
  "Whether the polyfill for the `path` and/or `node:path` package should be included in the generated bundle. When enabled imports of `path` and `node:path` will be replaced with the polyfill."
);

polyfills.recordOf.node.type.recordOf.fs.type.setDescription(
  "Whether the polyfill for the `fs`, `fs/promises`, `node:fs/promises`, and/or `node:fs` package should be included in the generated bundle. When enabled imports of `fs`, `fs/promises`, `node:fs/promises`, and `node:fs` will be replaced with the polyfill."
);

polyfills.recordOf.node.type.recordOf.querystring.type.setDescription(
  "Whether the polyfill for the `querystring` and/or `node:querystring` package should be included in the generated bundle. When enabled imports of `querystring` and `node:querystring` will be replaced with the polyfill."
);

polyfills.recordOf.node.type.recordOf.os.type.setDescription(
  "Whether the polyfill for the `os` and/or `node:os` package should be included in the generated bundle. When enabled imports of `os` and `node:os` will be replaced with the polyfill."
);

const { customPolyfills } = ConfigSchema.recordOf;

customPolyfills.type.setDescription(
  "Custom polyfills that should be included in the generated bundle.\n\nThis is useful for polyfills that are not included in the polyfills provided by react-gnome."
);

customPolyfills.type.arrayOf[0].recordOf.filepath.setDescription(
  "Path to the file containing the polyfill."
);

customPolyfills.type.arrayOf[0]!.recordOf.importName.type.setDescription(
  "The name of the import that should be replaced with the polyfill (for example `node:fs`, `path`, `os`, etc.). If not specified, each exported member of polyfill will be injected into the global scope."
);
