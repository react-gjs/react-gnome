import type { GetDataType } from "dilswer";
import { DataType, OptionalField } from "dilswer";
import type esbuild from "esbuild";

export const EsbuildPluginDataType = DataType.Custom(
  (v): v is esbuild.Plugin => {
    return typeof v === "object" && v != null;
  }
);

const RegexDataType = DataType.Custom((v): v is RegExp => {
  return typeof v === "object" && v !== null && v instanceof RegExp;
});

export const ConfigSchema = DataType.RecordOf({
  applicationName: DataType.String,
  applicationVersion: DataType.String,
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
      Soup: OptionalField(DataType.String),
      cairo: OptionalField(DataType.String),
      xlib: OptionalField(DataType.String),
    })
  ),
  outDir: DataType.String,
  minify: OptionalField(DataType.Boolean),
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
      node: OptionalField(
        DataType.RecordOf({
          path: OptionalField(DataType.Boolean),
          fs: OptionalField(DataType.Boolean),
        })
      ),
    })
  ),
  treeShake: OptionalField(DataType.Boolean),
});

ConfigSchema.recordOf.applicationName.setDescription(
  "The name of the application.\nThis is used to generate the name of the generated bundle."
);

ConfigSchema.recordOf.applicationVersion.setDescription(
  "The version of the application.\nThis is used to generate the bundle."
);

ConfigSchema.recordOf.entrypoint.setDescription(
  "The entrypoint file of the application.\nCan be a relative path from the project root or an absolute path."
);

ConfigSchema.recordOf.outDir.setDescription(
  "The output directory for the generated bundle.\nCan be a relative path from the project root or an absolute path."
);

ConfigSchema.recordOf.externalPackages.type.setDescription(
  "An array of packages that should be excluded from the bundle.\nThis is useful for packages that are already installed on the system and should not be bundled."
);

ConfigSchema.recordOf.minify.type.setDescription(
  "Whether the generated bundle should be minified.\nThis is useful for production builds.\nBy default is enabled in `production` mode and disabled in `development` mode."
);

ConfigSchema.recordOf.treeShake.type.setDescription(
  "Whether unused code should be removed from the bundle.\nThis is useful for production builds.\nBy default is enabled in `production` mode and disabled in `development` mode."
);

ConfigSchema.recordOf.esbuildPlugins.type.setDescription(
  "Esbuild plugins.\nPlugins can only be added via a JavaScript config file. If you are using a JSON config file and want to add a plugin, you will need to create a `react-gnome.config.js` file and use that instead."
);

ConfigSchema.recordOf.giVersions.type.setDescription(
  "The versions of the builtin libraries from the `gi://` namespace, that should be used in the generated bundle."
);

ConfigSchema.recordOf.envVars.type.recordOf.systemVars.type.setDescription(
  "Whether the system environment variables should be included in the generated bundle.\nBy default is always disabled."
);

ConfigSchema.recordOf.envVars.type.recordOf.allow.type.setDescription(
  "If system vars are enabled, an array of strings or a Regex of environment variables that can be included in the generated bundle.\nBy default allows all."
);

ConfigSchema.recordOf.envVars.type.recordOf.disallow.type.setDescription(
  "If system vars are enabled, an array of strings or a Regex of environment variables that should not be included in the generated bundle.\nBy default disallows none."
);

ConfigSchema.recordOf.envVars.type.recordOf.defaults.type.setDescription(
  "A dictionary of environment variables and values to use if the variable is not set in the system environment or .env file."
);

ConfigSchema.recordOf.envVars.type.recordOf.envFilePath.type.setDescription(
  "The path to the .env file. Should be a relative path from the project root. If this option is specified but the file does not exist, build will fail with an error.\nDefault is `.env`."
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

polyfills.recordOf.node.type.setDescription(
  "Polyfill options for some specific Node.js builtin packages."
);

polyfills.recordOf.node.type.recordOf.path.type.setDescription(
  "Whether the polyfill for the `path` and/or `node:path` package should be included in the generated bundle. When enabled imports of `path` and `node:path` will be replaced with the polyfill."
);

polyfills.recordOf.node.type.recordOf.fs.type.setDescription(
  "Whether the polyfill for the `fs`, `fs/promises`, `node:fs/promises`, and/or `node:fs` package should be included in the generated bundle. When enabled imports of `fs`, `fs/promises`, `node:fs/promises`, and `node:fs` will be replaced with the polyfill."
);

export type Config = GetDataType<typeof ConfigSchema>;

export type GiVersions = Config["giVersions"];
