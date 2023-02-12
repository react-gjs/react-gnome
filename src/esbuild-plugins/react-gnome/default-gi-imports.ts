import type { Config } from "../../config/config-type";

class GiImport {
  version?: string;

  constructor(private name: string) {}

  setVersion(version?: string) {
    this.version = version;
  }

  get(version?: string) {
    version ??= this.version;

    return `import ${this.name} from "gi://${this.name}${
      version ? `?version=${version}` : ""
    }";`;
  }
}

export class GiImports {
  imports: Map<string, GiImport> = new Map();

  constructor(private versions: Exclude<Config["giVersions"], undefined> = {}) {
    versions.Gtk ??= "3.0";
    versions.Soup ??= "2.4";
  }

  add(name: string, version?: string) {
    if (this.imports.has(name)) return;

    if (name in this.versions) {
      // @ts-expect-error
      version = this.versions[name];
    }

    const giImport = new GiImport(name);
    giImport.setVersion(version);

    this.imports.set(name, giImport);
  }

  toJavaScript() {
    return [...this.imports.values()].map((i) => i.get()).join("\n");
  }
}
