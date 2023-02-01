import { Program } from "./base";
type PackagingContext = {
    appID: string;
    appName: string;
    appVersion: string;
    packageName: string;
};
export declare class BuildProgram extends Program {
    additionalPlugins(): {};
    protected write(data: string, ...pathParts: string[]): Promise<void>;
    protected createDataDir(buildDirPath: string): Promise<void>;
    protected createMesonDir(buildDirPath: string): Promise<void>;
    protected createPoDir(buildDirPath: string): Promise<void>;
    protected preparePoDirFiles(poDirPath: string, context: PackagingContext): Promise<void>;
    protected prepareMesonDirFiles(mesonDirPath: string, context: PackagingContext): Promise<void>;
    protected prepareDataDirFiles(dataDirPath: string, context: PackagingContext): Promise<void>;
    protected prepareSrcDirFiles(srcDirPath: string, context: PackagingContext): Promise<void>;
    protected prepareMainBuildDirFiles(buildDirPath: string, context: PackagingContext): Promise<void>;
    protected prepareBuildFiles(appName: string, buildDirPath: string): Promise<PackagingContext>;
}
export {};
