import chalk from "chalk";
import type { ValidationError } from "dilswer/dist/types/validation-algorithms/validation-error/validation-error";

export const handleProgramError = (e: unknown) => {
  const isObject = (o: unknown): o is object =>
    typeof o === "object" && o != null;

  const isValidationError = (e: unknown): e is ValidationError => {
    return (isObject(e) && e instanceof Error && "fieldPath" in e) || false;
  };

  if (isValidationError(e)) {
    console.error(
      chalk.redBright(
        `Config file is invalid. Property "${chalk.yellowBright(
          e.fieldPath
        )}" is incorrect.`
      )
    );
  } else if (isObject(e) && e instanceof Error) {
    console.error("Build failed due to an error: ", chalk.redBright(e.message));
  } else {
    console.error(chalk.redBright("Build failed due to an unknown error."));
  }

  process.exit(1);
};
