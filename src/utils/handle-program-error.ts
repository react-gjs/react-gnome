import type { ValidationError } from "dilswer/dist/types/validation-algorithms/validation-error/validation-error";
import { html, Output } from "termx-markup";

const Stderr = new Output(console.error);

export const handleProgramError = (e: unknown) => {
  const isObject = (o: unknown): o is object => typeof o === "object" && o != null;

  const isValidationError = (e: unknown): e is ValidationError => {
    return (isObject(e) && e instanceof Error && "fieldPath" in e) || false;
  };

  if (isValidationError(e)) {
    Stderr.print(html`
      <span color="lightRed">
        Config file is invalid. Property
        <pre color="lightYellow"> ${e.fieldPath} </pre>
        is incorrect.
      </span>
    `);
  } else if (isObject(e) && e instanceof Error) {
    Stderr.print(html`
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
    `);
  } else {
    console.error(e);
    Stderr.print(html`
      <span color="lightRed"> Build failed due to an unknown error. </span>
    `);
  }

  process.exit(1);
};
