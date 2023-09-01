export declare function _async<T = void>(callback: (promise: {
    resolve(v: T): void;
    reject(e: any): void;
}) => void): Promise<T>;
