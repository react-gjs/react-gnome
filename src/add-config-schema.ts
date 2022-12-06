import fs from "fs/promises";
import path from "path";

export const CONFIG_FILE_NAME = "react-gtk.config.json";

export const addConfigSchema = async (cwd: string) => {
  const vscodeDir = path.resolve(cwd, ".vscode");
  const vscodeSettingsFile = path.resolve(vscodeDir, "settings.json");
  await fs.mkdir(vscodeDir, { recursive: true });

  let settings: { "json.schemas"?: { fileMatch?: unknown; url: string }[] } =
    {};

  const vscodeFiles = await fs.readdir(vscodeDir);
  if (vscodeFiles.includes("settings.json")) {
    const f = await fs.readFile(vscodeSettingsFile, { encoding: "utf-8" });
    settings = JSON.parse(f);
  }

  if (!settings["json.schemas"]) {
    settings["json.schemas"] = [];
  }

  if (
    !settings["json.schemas"].some((s) => {
      const isObject = typeof s === "object" && s !== null;
      if (isObject) {
        const fileMatch = s.fileMatch;
        if (Array.isArray(fileMatch)) {
          return fileMatch.includes(CONFIG_FILE_NAME);
        }
        return fileMatch === CONFIG_FILE_NAME;
      }

      return false;
    })
  ) {
    settings["json.schemas"].push({
      fileMatch: [CONFIG_FILE_NAME],
      url: "./node_modules/react-gtk/dist/config-schema.json",
    });

    await fs.writeFile(vscodeSettingsFile, JSON.stringify(settings, null, 2));
  }
};

addConfigSchema(process.cwd());
