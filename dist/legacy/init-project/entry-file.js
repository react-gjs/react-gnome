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

// src/init-project/entry-file.ts
var entry_file_exports = {};
__export(entry_file_exports, {
  getEntryFile: () => getEntryFile
});
module.exports = __toCommonJS(entry_file_exports);
var getEntryFile = () => (
  /* ts */
  `
import React from "react";
import {
  Align,
  Markup,
  render,
  ScrollBox,
  Span,
  Window,
} from "react-gjs-renderer";
import "react-gnome";
import env from "gapp:env";

render(
    <Window quitAppOnClose title="React Gnome App">
      <ScrollBox
        useChildHeight
        useChildWidth
        verticalAlign={Align.CENTER}
        horizontalAlign={Align.CENTER}
        margin={[150, 100]}
      >
        <Markup>
          <Span fontSize={32}>React Gnome App</Span>
        </Markup>
      </ScrollBox>
    </Window>,
    {
      appId: env.appId,
    }
);
`.trim() + "\n"
);
