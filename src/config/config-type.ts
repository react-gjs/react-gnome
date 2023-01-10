import type { GetDataType } from "dilswer";
import type { ConfigSchema } from "./config-schema";

export type Config = GetDataType<typeof ConfigSchema>;
