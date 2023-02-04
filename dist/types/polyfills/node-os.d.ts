declare namespace os_default {
    const EOL = "\n";
    const constants: {
        signals: {
            SIGHUP: number;
            SIGINT: number;
            SIGQUIT: number;
            SIGILL: number;
            SIGTRAP: number;
            SIGABRT: number;
            SIGFPE: number;
            SIGKILL: number;
            SIGSEGV: number;
            SIGPIPE: number;
            SIGALRM: number;
            SIGTERM: number;
        };
    };
    function availableParallelism(): number;
    const arch: () => string;
    function cpus(): {
        model: string;
        speed: number;
        times: {
            user: number;
            nice: number;
            sys: number;
            idle: number;
            irq: number;
        };
    }[];
    const devNull: () => string;
    function freemem(): number;
    function homedir(): string;
    function hostname(): string;
    const machine: () => string;
    const platform: () => string;
    const release: () => string;
    function tmpdir(): string;
    function totalmem(): number;
    const type: () => string;
    function uptime(): number;
    function userInfo(): {
        uid: number;
        gid: number;
        username: string;
        homedir: string;
        shell: string;
    };
    function version(): string;
}
export default os_default;
export declare const EOL = "\n";
export declare const constants: {
    signals: {
        SIGHUP: number;
        SIGINT: number;
        SIGQUIT: number;
        SIGILL: number;
        SIGTRAP: number;
        SIGABRT: number;
        SIGFPE: number;
        SIGKILL: number;
        SIGSEGV: number;
        SIGPIPE: number;
        SIGALRM: number;
        SIGTERM: number;
    };
};
export declare const availableParallelism: typeof os_default.availableParallelism;
export declare const arch: () => string;
export declare const cpus: typeof os_default.cpus;
export declare const devNull: () => string;
export declare const freemem: typeof os_default.freemem;
export declare const homedir: typeof os_default.homedir;
export declare const hostname: typeof os_default.hostname;
export declare const machine: () => string;
export declare const platform: () => string;
export declare const release: () => string;
export declare const tmpdir: typeof os_default.tmpdir;
export declare const totalmem: typeof os_default.totalmem;
export declare const type: () => string;
export declare const uptime: typeof os_default.uptime;
export declare const userInfo: typeof os_default.userInfo;
export declare const version: typeof os_default.version;
