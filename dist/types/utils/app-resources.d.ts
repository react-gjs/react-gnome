declare class AppResource {
    private origin;
    private appID;
    private uid;
    constructor(origin: string, appID: string);
    get name(): string;
    get fullPath(): string;
    get resourceString(): string;
}
export declare class AppResources {
    private appID;
    private resources;
    constructor(appID: string);
    registerResource(origin: string): AppResource;
    getAll(): AppResource[];
}
export {};
