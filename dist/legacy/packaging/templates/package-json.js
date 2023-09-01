"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
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

// src/packaging/templates/package-json.ts
var package_json_exports = {};
__export(package_json_exports, {
  getPackageJson: () => getPackageJson
});
module.exports = __toCommonJS(package_json_exports);
var getPackageJson = (params) => {
  return JSON.stringify(
    {
      "app-id": params.appID,
      runtime: "org.gnome.Platform",
      "runtime-version": "40",
      branch: "stable",
      sdk: "org.gnome.Sdk",
      command: "/app/bin/" + params.appID,
      "finish-args": [
        "--share=ipc",
        "--socket=fallback-x11",
        "--socket=wayland",
        "--share=network"
      ],
      cleanup: [
        "/include",
        "/lib/pkgconfig",
        "/share/pkgconfig",
        "/share/aclocal",
        "/man",
        "/share/man",
        "/share/gtk-doc",
        "/share/vala",
        "*.la",
        "*.a"
      ],
      modules: [
        {
          name: params.packageName,
          sources: [
            {
              type: "git",
              url: params.gitURL ?? ""
            }
          ]
        }
      ],
      "build-options": {
        env: {}
      }
    },
    null,
    2
  );
};
