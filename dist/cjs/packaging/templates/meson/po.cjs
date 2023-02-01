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

// src/packaging/templates/meson/po.ts
var po_exports = {};
__export(po_exports, {
  getPoMesonBuild: () => getPoMesonBuild
});
module.exports = __toCommonJS(po_exports);
var getPoMesonBuild = () => `
langs = [
    'en'
]

if langs.length() > 0
intl.gettext(GETTEXT_PACKAGE,
    languages: langs,
    args: [
    '--from-code=UTF-8',
    '--keyword=g_dngettext:2,3',
    '--add-comments',
    ],
)
endif
  
`;
