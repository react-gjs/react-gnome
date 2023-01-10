import { appIDToPath } from "../../utils/app-id-to-path";

export const getGResourceXml = (params: { appID: string; files?: string[] }) =>
  /* xml */ `
<?xml version="1.0" encoding="UTF-8"?>
<gresources>
  <gresource prefix="/${appIDToPath(params.appID)}/js">
    <file>main.js</file>${
      params.files
        ? "\n" +
          params.files.map((f) => /* xml */ `    <file>${f}</file>`).join("\n")
        : ""
    }
  </gresource>
</gresources>
`.trim();
