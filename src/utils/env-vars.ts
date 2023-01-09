export type EnvVariableValue = string | number | boolean | undefined;

export class EnvVars {
  private defined = new Map<string, EnvVariableValue>();

  public define(name: string, value: EnvVariableValue) {
    this.defined.set(name, value);
  }

  public toJavascriptModule() {
    return `export default { ${Array.from(this.defined)
      .map(([name, value]) => `${name}: ${JSON.stringify(value)}`)
      .join(", ")} }`;
  }
}
