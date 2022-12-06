import type { GetDataType } from "dilswer";
import { DataType, OptionalField } from "dilswer";

export const ConfigSchema = DataType.RecordOf({
  entrypoint: DataType.String,
  outDir: DataType.String,
  externalPackages: OptionalField(DataType.ArrayOf(DataType.String)),
  minify: OptionalField(DataType.Boolean),
});

ConfigSchema.recordOf.entrypoint.setDescription(
  "The entrypoint file of the application.\n\nCan be a relative path from the project root or an absolute path."
);

ConfigSchema.recordOf.outDir.setDescription(
  "The output directory for the generated bundle.\n\nCan be a relative path from the project root or an absolute path."
);

ConfigSchema.recordOf.externalPackages.type.setDescription(
  "An array of packages that should be excluded from the bundle.\n\nThis is useful for packages that are already installed on the system and should not be bundled."
);

ConfigSchema.recordOf.minify.type.setDescription(
  "Whether the generated bundle should be minified.\n\nThis is useful for production builds."
);

export type Config = GetDataType<typeof ConfigSchema>;
