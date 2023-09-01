import type { Plugin as EsbuildPlugin } from "esbuild";
export declare const EsbuildPluginDataType: import("dilswer").Custom<(v: any) => v is EsbuildPlugin>;
export declare const ConfigSchema: import("dilswer").RecordOf<{
    applicationName: import("dilswer/dist/types/data-types/data-types").SimpleDataType<"string">;
    applicationVersion: import("dilswer/dist/types/data-types/data-types").SimpleDataType<"string">;
    applicationPrefix: {
        readonly type: import("dilswer/dist/types/data-types/data-types").SimpleDataType<"string">;
        readonly required: false;
    };
    entrypoint: import("dilswer/dist/types/data-types/data-types").SimpleDataType<"string">;
    envVars: {
        readonly type: import("dilswer").RecordOf<{
            allow: {
                readonly type: import("dilswer").OneOf<[import("dilswer").ArrayOf<[import("dilswer/dist/types/data-types/data-types").SimpleDataType<"string">]>, import("dilswer/dist/types/data-types/data-types").InstanceOf<RegExpConstructor>]>;
                readonly required: false;
            };
            defaults: {
                readonly type: import("dilswer").Dict<[import("dilswer/dist/types/data-types/data-types").SimpleDataType<"string">, import("dilswer/dist/types/data-types/data-types").SimpleDataType<"number">, import("dilswer/dist/types/data-types/data-types").SimpleDataType<"boolean">]>;
                readonly required: false;
            };
            disallow: {
                readonly type: import("dilswer").OneOf<[import("dilswer").ArrayOf<[import("dilswer/dist/types/data-types/data-types").SimpleDataType<"string">]>, import("dilswer/dist/types/data-types/data-types").InstanceOf<RegExpConstructor>]>;
                readonly required: false;
            };
            envFilePath: {
                readonly type: import("dilswer/dist/types/data-types/data-types").SimpleDataType<"string">;
                readonly required: false;
            };
            systemVars: {
                readonly type: import("dilswer/dist/types/data-types/data-types").SimpleDataType<"boolean">;
                readonly required: false;
            };
        }>;
        readonly required: false;
    };
    esbuildPlugins: {
        readonly type: import("dilswer").ArrayOf<[import("dilswer").Custom<(v: any) => v is EsbuildPlugin>]>;
        readonly required: false;
    };
    externalPackages: {
        readonly type: import("dilswer").ArrayOf<[import("dilswer/dist/types/data-types/data-types").SimpleDataType<"string">]>;
        readonly required: false;
    };
    friendlyName: {
        readonly type: import("dilswer/dist/types/data-types/data-types").SimpleDataType<"string">;
        readonly required: false;
    };
    giVersions: {
        readonly type: import("dilswer").RecordOf<{
            Gtk: {
                readonly type: import("dilswer").Literal<"3.0">;
                readonly required: false;
            };
            Gdk: {
                readonly type: import("dilswer/dist/types/data-types/data-types").SimpleDataType<"string">;
                readonly required: false;
            };
            Gio: {
                readonly type: import("dilswer/dist/types/data-types/data-types").SimpleDataType<"string">;
                readonly required: false;
            };
            GLib: {
                readonly type: import("dilswer/dist/types/data-types/data-types").SimpleDataType<"string">;
                readonly required: false;
            };
            GObject: {
                readonly type: import("dilswer/dist/types/data-types/data-types").SimpleDataType<"string">;
                readonly required: false;
            };
            Pango: {
                readonly type: import("dilswer/dist/types/data-types/data-types").SimpleDataType<"string">;
                readonly required: false;
            };
            Atk: {
                readonly type: import("dilswer/dist/types/data-types/data-types").SimpleDataType<"string">;
                readonly required: false;
            };
            Cairo: {
                readonly type: import("dilswer/dist/types/data-types/data-types").SimpleDataType<"string">;
                readonly required: false;
            };
            GModule: {
                readonly type: import("dilswer/dist/types/data-types/data-types").SimpleDataType<"string">;
                readonly required: false;
            };
            GdkPixbuf: {
                readonly type: import("dilswer/dist/types/data-types/data-types").SimpleDataType<"string">;
                readonly required: false;
            };
            Cally: {
                readonly type: import("dilswer/dist/types/data-types/data-types").SimpleDataType<"string">;
                readonly required: false;
            };
            Clutter: {
                readonly type: import("dilswer/dist/types/data-types/data-types").SimpleDataType<"string">;
                readonly required: false;
            };
            ClutterX11: {
                readonly type: import("dilswer/dist/types/data-types/data-types").SimpleDataType<"string">;
                readonly required: false;
            };
            Cogl: {
                readonly type: import("dilswer/dist/types/data-types/data-types").SimpleDataType<"string">;
                readonly required: false;
            };
            Graphene: {
                readonly type: import("dilswer/dist/types/data-types/data-types").SimpleDataType<"string">;
                readonly required: false;
            };
            Gst: {
                readonly type: import("dilswer/dist/types/data-types/data-types").SimpleDataType<"string">;
                readonly required: false;
            };
            HarfBuzz: {
                readonly type: import("dilswer/dist/types/data-types/data-types").SimpleDataType<"string">;
                readonly required: false;
            };
            Soup: {
                readonly type: import("dilswer").Literal<"2.4">;
                readonly required: false;
            };
            cairo: {
                readonly type: import("dilswer/dist/types/data-types/data-types").SimpleDataType<"string">;
                readonly required: false;
            };
            xlib: {
                readonly type: import("dilswer/dist/types/data-types/data-types").SimpleDataType<"string">;
                readonly required: false;
            };
        }>;
        readonly required: false;
    };
    license: {
        readonly type: import("dilswer/dist/types/data-types/data-types").SimpleDataType<"string">;
        readonly required: false;
    };
    minify: {
        readonly type: import("dilswer/dist/types/data-types/data-types").SimpleDataType<"boolean">;
        readonly required: false;
    };
    outDir: import("dilswer/dist/types/data-types/data-types").SimpleDataType<"string">;
    polyfills: {
        readonly type: import("dilswer").RecordOf<{
            AbortController: {
                readonly type: import("dilswer/dist/types/data-types/data-types").SimpleDataType<"boolean">;
                readonly required: false;
            };
            Blob: {
                readonly type: import("dilswer/dist/types/data-types/data-types").SimpleDataType<"boolean">;
                readonly required: false;
            };
            Buffer: {
                readonly type: import("dilswer/dist/types/data-types/data-types").SimpleDataType<"boolean">;
                readonly required: false;
            };
            FormData: {
                readonly type: import("dilswer/dist/types/data-types/data-types").SimpleDataType<"boolean">;
                readonly required: false;
            };
            URL: {
                readonly type: import("dilswer/dist/types/data-types/data-types").SimpleDataType<"boolean">;
                readonly required: false;
            };
            XMLHttpRequest: {
                readonly type: import("dilswer/dist/types/data-types/data-types").SimpleDataType<"boolean">;
                readonly required: false;
            };
            base64: {
                readonly type: import("dilswer/dist/types/data-types/data-types").SimpleDataType<"boolean">;
                readonly required: false;
            };
            fetch: {
                readonly type: import("dilswer/dist/types/data-types/data-types").SimpleDataType<"boolean">;
                readonly required: false;
            };
            WebSocket: {
                readonly type: import("dilswer/dist/types/data-types/data-types").SimpleDataType<"boolean">;
                readonly required: false;
            };
            node: {
                readonly type: import("dilswer").RecordOf<{
                    path: {
                        readonly type: import("dilswer/dist/types/data-types/data-types").SimpleDataType<"boolean">;
                        readonly required: false;
                    };
                    fs: {
                        readonly type: import("dilswer/dist/types/data-types/data-types").SimpleDataType<"boolean">;
                        readonly required: false;
                    };
                    querystring: {
                        readonly type: import("dilswer/dist/types/data-types/data-types").SimpleDataType<"boolean">;
                        readonly required: false;
                    };
                    os: {
                        readonly type: import("dilswer/dist/types/data-types/data-types").SimpleDataType<"boolean">;
                        readonly required: false;
                    };
                }>;
                readonly required: false;
            };
        }>;
        readonly required: false;
    };
    customPolyfills: {
        readonly type: import("dilswer").ArrayOf<[import("dilswer").RecordOf<{
            filepath: import("dilswer/dist/types/data-types/data-types").SimpleDataType<"string">;
            importName: {
                readonly type: import("dilswer/dist/types/data-types/data-types").SimpleDataType<"string">;
                readonly required: false;
            };
        }>]>;
        readonly required: false;
    };
    treeShake: {
        readonly type: import("dilswer/dist/types/data-types/data-types").SimpleDataType<"boolean">;
        readonly required: false;
    };
}>;
