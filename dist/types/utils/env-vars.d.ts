export type EnvVariableValue = string | number | boolean | undefined;
export declare class EnvVars {
    private defined;
    define(name: string, value: EnvVariableValue): void;
    toJavascriptModule(): string;
}
