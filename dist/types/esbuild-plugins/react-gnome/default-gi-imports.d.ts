import type { Config } from "../../config/config-type";
declare class GiImport {
    private name;
    version?: string;
    constructor(name: string);
    setVersion(version?: string): void;
    get(version?: string): string;
}
export declare class GiImports {
    private versions;
    imports: Map<string, GiImport>;
    constructor(versions?: Exclude<Config["giVersions"], undefined>);
    private printVersionConflict;
    add(name: string, version?: string): void;
    toJavaScript(): string;
}
export {};
