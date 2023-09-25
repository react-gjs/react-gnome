export declare class FsError extends Error {
    code: string;
    path?: string | undefined;
    constructor(message: string, code: string, path?: string | undefined, cause?: any);
}
export declare class ArgTypeError extends TypeError {
    code: string;
    constructor(message: string);
}
