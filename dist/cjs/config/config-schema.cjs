"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/config/config-schema.ts
var config_schema_exports = {};
__export(config_schema_exports, {
  ConfigSchema: () => ConfigSchema,
  EsbuildPluginDataType: () => EsbuildPluginDataType
});
module.exports = __toCommonJS(config_schema_exports);
var import_dilswer = require("dilswer");
var EsbuildPluginDataType = import_dilswer.DataType.RecordOf({
  name: import_dilswer.DataType.String,
  setup: import_dilswer.DataType.Function
}).setTitle("EsbuildPlugin");
var RegexDataType = import_dilswer.DataType.InstanceOf(RegExp);
RegexDataType.setDescription(
  "A Regular expression. Only supported in JavaScript config files."
);
var ConfigSchema = import_dilswer.DataType.RecordOf({
  applicationName: import_dilswer.DataType.String,
  applicationVersion: import_dilswer.DataType.String,
  applicationPrefix: (0, import_dilswer.OptionalField)(import_dilswer.DataType.String),
  entrypoint: import_dilswer.DataType.String,
  envVars: (0, import_dilswer.OptionalField)(
    import_dilswer.DataType.RecordOf({
      allow: (0, import_dilswer.OptionalField)(
        import_dilswer.DataType.OneOf(import_dilswer.DataType.ArrayOf(import_dilswer.DataType.String), RegexDataType)
      ),
      defaults: (0, import_dilswer.OptionalField)(
        import_dilswer.DataType.Dict(import_dilswer.DataType.String, import_dilswer.DataType.Number, import_dilswer.DataType.Boolean)
      ),
      disallow: (0, import_dilswer.OptionalField)(
        import_dilswer.DataType.OneOf(import_dilswer.DataType.ArrayOf(import_dilswer.DataType.String), RegexDataType)
      ),
      envFilePath: (0, import_dilswer.OptionalField)(import_dilswer.DataType.String),
      systemVars: (0, import_dilswer.OptionalField)(import_dilswer.DataType.Boolean)
    })
  ),
  esbuildPlugins: (0, import_dilswer.OptionalField)(import_dilswer.DataType.ArrayOf(EsbuildPluginDataType)),
  externalPackages: (0, import_dilswer.OptionalField)(import_dilswer.DataType.ArrayOf(import_dilswer.DataType.String)),
  friendlyName: (0, import_dilswer.OptionalField)(import_dilswer.DataType.String),
  giVersions: (0, import_dilswer.OptionalField)(
    import_dilswer.DataType.RecordOf({
      Gtk: (0, import_dilswer.OptionalField)(import_dilswer.DataType.Literal("3.0")),
      Gdk: (0, import_dilswer.OptionalField)(import_dilswer.DataType.String),
      Gio: (0, import_dilswer.OptionalField)(import_dilswer.DataType.String),
      GLib: (0, import_dilswer.OptionalField)(import_dilswer.DataType.String),
      GObject: (0, import_dilswer.OptionalField)(import_dilswer.DataType.String),
      Pango: (0, import_dilswer.OptionalField)(import_dilswer.DataType.String),
      Atk: (0, import_dilswer.OptionalField)(import_dilswer.DataType.String),
      Cairo: (0, import_dilswer.OptionalField)(import_dilswer.DataType.String),
      GModule: (0, import_dilswer.OptionalField)(import_dilswer.DataType.String),
      GdkPixbuf: (0, import_dilswer.OptionalField)(import_dilswer.DataType.String),
      Cally: (0, import_dilswer.OptionalField)(import_dilswer.DataType.String),
      Clutter: (0, import_dilswer.OptionalField)(import_dilswer.DataType.String),
      ClutterX11: (0, import_dilswer.OptionalField)(import_dilswer.DataType.String),
      Cogl: (0, import_dilswer.OptionalField)(import_dilswer.DataType.String),
      Graphene: (0, import_dilswer.OptionalField)(import_dilswer.DataType.String),
      Gst: (0, import_dilswer.OptionalField)(import_dilswer.DataType.String),
      HarfBuzz: (0, import_dilswer.OptionalField)(import_dilswer.DataType.String),
      Soup: (0, import_dilswer.OptionalField)(import_dilswer.DataType.String),
      cairo: (0, import_dilswer.OptionalField)(import_dilswer.DataType.String),
      xlib: (0, import_dilswer.OptionalField)(import_dilswer.DataType.String)
    })
  ),
  license: (0, import_dilswer.OptionalField)(import_dilswer.DataType.String),
  minify: (0, import_dilswer.OptionalField)(import_dilswer.DataType.Boolean),
  outDir: import_dilswer.DataType.String,
  polyfills: (0, import_dilswer.OptionalField)(
    import_dilswer.DataType.RecordOf({
      AbortController: (0, import_dilswer.OptionalField)(import_dilswer.DataType.Boolean),
      Blob: (0, import_dilswer.OptionalField)(import_dilswer.DataType.Boolean),
      Buffer: (0, import_dilswer.OptionalField)(import_dilswer.DataType.Boolean),
      FormData: (0, import_dilswer.OptionalField)(import_dilswer.DataType.Boolean),
      URL: (0, import_dilswer.OptionalField)(import_dilswer.DataType.Boolean),
      XMLHttpRequest: (0, import_dilswer.OptionalField)(import_dilswer.DataType.Boolean),
      base64: (0, import_dilswer.OptionalField)(import_dilswer.DataType.Boolean),
      fetch: (0, import_dilswer.OptionalField)(import_dilswer.DataType.Boolean),
      node: (0, import_dilswer.OptionalField)(
        import_dilswer.DataType.RecordOf({
          path: (0, import_dilswer.OptionalField)(import_dilswer.DataType.Boolean),
          fs: (0, import_dilswer.OptionalField)(import_dilswer.DataType.Boolean)
        })
      )
    })
  ),
  treeShake: (0, import_dilswer.OptionalField)(import_dilswer.DataType.Boolean)
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
var polyfills = ConfigSchema.recordOf.polyfills.type;
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
