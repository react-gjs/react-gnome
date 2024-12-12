import { html, Output } from "termx-markup";
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

  private printVersionConflict(name: string, v1: string, v2: string) {
    Output.print(html`
      <span>
        <span color="yellow">WARN:</span>
        <span>
          GI dependency (${name}) version conflict. ${v1} and ${v2} are both
          required at the same time.
        </span>
      </span>
    `);
  }

  add(name: string, version?: string) {
    if (this.imports.has(name)) {
      const im = this.imports.get(name)!;
      if (version != null) {
        if (im.version == null) {
          im.setVersion(version);
        } else if (version !== im.version) {
          this.printVersionConflict(name, im.version, version!);
        }
      }
      return;
    }

    if (name in this.versions) {
      // @ts-expect-error
      const versionOverride = this.versions[name];
      if (version != null && version !== versionOverride) {
        this.printVersionConflict(name, versionOverride, version!);
      }
      version = versionOverride;
    }

    const giImport = new GiImport(name);
    giImport.setVersion(version);

    this.imports.set(name, giImport);
  }

  toJavaScript() {
    return [...this.imports.values()].map((i) => i.get()).join("\n");
  }
}
