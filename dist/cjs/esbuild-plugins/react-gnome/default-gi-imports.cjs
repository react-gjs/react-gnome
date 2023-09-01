"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};

// src/esbuild-plugins/react-gnome/default-gi-imports.ts
var default_gi_imports_exports = {};
__export(default_gi_imports_exports, {
  GiImports: () => GiImports
});
module.exports = __toCommonJS(default_gi_imports_exports);
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
