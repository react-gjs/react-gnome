export declare class Command {
    private command;
    private args;
    private options;
    constructor(command: string, args: string[], options: {
        cwd?: string;
    });
    run(): Promise<string>;
}
