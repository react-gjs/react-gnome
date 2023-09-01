var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};

// src/esbuild-plugins/react-gnome/default-gi-imports.ts
var GiImport = class {
  constructor(name) {
    this.name = name;
    __publicField(this, "version");
  }
  setVersion(version) {
    this.version = version;
  }
  get(version) {
    version ?? (version = this.version);
    return `import ${this.name} from "gi://${this.name}${version ? `?version=${version}` : ""}";`;
  }
};
var GiImports = class {
  constructor(versions = {}) {
    this.versions = versions;
    __publicField(this, "imports", /* @__PURE__ */ new Map());
    versions.Gtk ?? (versions.Gtk = "3.0");
    versions.Soup ?? (versions.Soup = "2.4");
  }
  add(name, version) {
    if (this.imports.has(name))
      return;
    if (name in this.versions) {
      version = this.versions[name];
    }
    const giImport = new GiImport(name);
    giImport.setVersion(version);
    this.imports.set(name, giImport);
  }
  toJavaScript() {
    return [...this.imports.values()].map((i) => i.get()).join("\n");
  }
};
export {
  GiImports
};
