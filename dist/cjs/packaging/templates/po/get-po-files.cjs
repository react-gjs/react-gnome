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

// src/packaging/templates/po/get-po-files.ts
var get_po_files_exports = {};
__export(get_po_files_exports, {
  getPoFiles: () => getPoFiles
});
module.exports = __toCommonJS(get_po_files_exports);
var getPoFiles = (params) => [
  {
    language: "en",
    content: `
msgid ""
msgstr ""
"Project-Id-Version: ${params.appName} 1.0.0\\n"
"Report-Msgid-Bugs-To: \\n"
"POT-Creation-Date: 2013-02-22 03:56+0100\\n"
"PO-Revision-Date: 2013-02-22 03:58+0100\\n"
"Last-Translator: \\n"
"Language-Team: English\\n"
"Language: en\\n"
"MIME-Version: 1.0\\n"
"Content-Type: text/plain; charset=utf-8\\n"
"Content-Transfer-Encoding: 8bit\\n"
`.trim()
  }
];
