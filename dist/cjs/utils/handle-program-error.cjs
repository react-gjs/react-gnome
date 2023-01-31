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

// src/utils/handle-program-error.ts
var handle_program_error_exports = {};
__export(handle_program_error_exports, {
  handleProgramError: () => handleProgramError
});
module.exports = __toCommonJS(handle_program_error_exports);
var import_termx_markup = require("termx-markup");
var Stderr = new import_termx_markup.Output(console.error);
var handleProgramError = (e) => {
  const isObject = (o) => typeof o === "object" && o != null;
  const isValidationError = (e2) => {
    return isObject(e2) && e2 instanceof Error && "fieldPath" in e2 || false;
  };
  if (isValidationError(e)) {
    Stderr.print(
      import_termx_markup.html`
        <span color="lightRed">
          Config file is invalid. Property
          <pre color="lightYellow"> ${e.fieldPath} </pre>
          is incorrect.
        </span>
      `
    );
  } else if (isObject(e) && e instanceof Error) {
    Stderr.print(
      import_termx_markup.html`
        <span>
          <line> Build failed due to an error: </line>
          <pad size="2">
            <pre color="lightRed">${e.message}</pre>
          </pad>
          <br />
          <pad size="2">
            <pre color="lightYellow">${e.stack}</pre>
          </pad>
        </span>
      `
    );
  } else {
    console.error(e);
    Stderr.print(
      import_termx_markup.html`
        <span color="lightRed"> Build failed due to an unknown error. </span>
      `
    );
  }
  process.exit(1);
};
