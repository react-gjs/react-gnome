import type { Program } from "../programs/base";
export declare const readConfig: (program: Program) => Promise<{
    applicationPrefix?: string | undefined;
    envVars?: {
        allow?: string[] | {
            exec: (string: string) => RegExpExecArray | null;
            test: (string: string) => boolean;
            readonly source: string;
            readonly global: boolean;
            readonly ignoreCase: boolean;
            readonly multiline: boolean;
            lastIndex: number;
            compile: (pattern: string, flags?: string | undefined) => RegExp;
            readonly flags: string;
            readonly sticky: boolean;
            readonly unicode: boolean;
            readonly dotAll: boolean;
            [Symbol.match]: (string: string) => RegExpMatchArray | null;
            [Symbol.replace]: {
                (string: string, replaceValue: string): string;
                (string: string, replacer: (substring: string, ...args: any[]) => string): string;
            };
            [Symbol.search]: (string: string) => number;
            [Symbol.split]: (string: string, limit?: number | undefined) => string[];
            [Symbol.matchAll]: (str: string) => IterableIterator<RegExpMatchArray>;
        } | undefined;
        defaults?: {
            [x: string]: string | number | boolean;
            [x: number]: string | number | boolean;
        } | undefined;
        disallow?: string[] | {
            exec: (string: string) => RegExpExecArray | null;
            test: (string: string) => boolean;
            readonly source: string;
            readonly global: boolean;
            readonly ignoreCase: boolean;
            readonly multiline: boolean;
            lastIndex: number;
            compile: (pattern: string, flags?: string | undefined) => RegExp;
            readonly flags: string;
            readonly sticky: boolean;
            readonly unicode: boolean;
            readonly dotAll: boolean;
            [Symbol.match]: (string: string) => RegExpMatchArray | null;
            [Symbol.replace]: {
                (string: string, replaceValue: string): string;
                (string: string, replacer: (substring: string, ...args: any[]) => string): string;
            };
            [Symbol.search]: (string: string) => number;
            [Symbol.split]: (string: string, limit?: number | undefined) => string[];
            [Symbol.matchAll]: (str: string) => IterableIterator<RegExpMatchArray>;
        } | undefined;
        envFilePath?: string | undefined;
        systemVars?: boolean | undefined;
    } | undefined;
    esbuildPlugins?: {
        name: string;
        setup: (build: import("esbuild").PluginBuild) => void | Promise<void>;
    }[] | undefined;
    externalPackages?: string[] | undefined;
    friendlyName?: string | undefined;
    giVersions?: {
        Gtk?: "3.0" | undefined;
        Gdk?: string | undefined;
        Gio?: string | undefined;
        GLib?: string | undefined;
        GObject?: string | undefined;
        Pango?: string | undefined;
        Atk?: string | undefined;
        Cairo?: string | undefined;
        GModule?: string | undefined;
        GdkPixbuf?: string | undefined;
        Cally?: string | undefined;
        Clutter?: string | undefined;
        ClutterX11?: string | undefined;
        Cogl?: string | undefined;
        Graphene?: string | undefined;
        Gst?: string | undefined;
        HarfBuzz?: string | undefined;
        Soup?: "2.4" | undefined;
        cairo?: string | undefined;
        xlib?: string | undefined;
    } | undefined;
    license?: string | undefined;
    minify?: boolean | undefined;
    polyfills?: {
        base64?: boolean | undefined;
        AbortController?: boolean | undefined;
        Blob?: boolean | undefined;
        Buffer?: boolean | undefined;
        FormData?: boolean | undefined;
        URL?: boolean | undefined;
        XMLHttpRequest?: boolean | undefined;
        fetch?: boolean | undefined;
        WebSocket?: boolean | undefined;
        node?: {
            path?: boolean | undefined;
            fs?: boolean | undefined;
            querystring?: boolean | undefined;
            os?: boolean | undefined;
        } | undefined;
    } | undefined;
    customPolyfills?: {
        importName?: string | undefined;
        filepath: string;
    }[] | undefined;
    treeShake?: boolean | undefined;
    applicationName: string;
    applicationVersion: string;
    entrypoint: string;
    outDir: string;
}>;
