/// <reference path="../gapp:env.d.ts" preserve="true" />
/// <reference path="../resources.d.ts" preserve="true"" />

export type { Config as BuildConfig } from "./config/config-type";

declare global {
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
  }
}
