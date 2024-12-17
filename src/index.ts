/// <reference path="../gapp:env.d.ts" preserve="true" />
/// <reference path="../resources.d.ts" preserve="true"" />

export type { Config as BuildConfig } from "./config/config-type";

declare global {
  type ConsoleLogLevel =
    | "info"
    | "log"
    | "error"
    | "warn"
    | "assert"
    | "debug"
    | "trace"
    | "count"
    | "countReset"
    | "dir"
    | "dirxml"
    | "group"
    | "groupCollapsed"
    | "timeLog"
    | "timeEnd";

  interface Console {
    /**
     * When disabled the output will not be prettified with ANSI colors.
     */
    setPretty(pretty: boolean): void;
    /**
     * Given a stack trace, returns that same stack trace with all the paths
     * replaced with the paths of the original source files in the project
     * (if source maps are available).
     *
     * Source maps must not be disabled in the React GTK config in order for this
     * function to work.
     */
    mapStackTrace(stackTrace: string): string;
    /*
     * Formats given stack trace in the same way the console would format
     * it when given an error to print.
     */
    formatStackTrace(stackTrace: string, indent?: number): string;
    /**
     * Registers a listener callback that will be called whenever a log
     * message is printed out.
     *
     * @returns A function that when called will remove the listener.
     */
    onLogPrinted(
      cb: (logType: ConsoleLogLevel, message: string) => {},
    ): () => void;
  }
}

export * from "@reactgjs/renderer";
