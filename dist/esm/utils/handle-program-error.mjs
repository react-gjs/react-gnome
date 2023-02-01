// src/utils/handle-program-error.ts
import { html, Output } from "termx-markup";
var Stderr = new Output(console.error);
var handleProgramError = (e) => {
  const isObject = (o) => typeof o === "object" && o != null;
  const isValidationError = (e2) => {
    return isObject(e2) && e2 instanceof Error && "fieldPath" in e2 || false;
  };
  if (isValidationError(e)) {
    Stderr.print(
      html`
        <span color="lightRed">
          Config file is invalid. Property
          <pre color="lightYellow"> ${e.fieldPath} </pre>
          is incorrect.
        </span>
      `
    );
  } else if (isObject(e) && e instanceof Error) {
    Stderr.print(
      html`
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
      html`
        <span color="lightRed"> Build failed due to an unknown error. </span>
      `
    );
  }
  process.exit(1);
};
export {
  handleProgramError
};
