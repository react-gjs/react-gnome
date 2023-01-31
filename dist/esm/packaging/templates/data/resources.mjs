// src/packaging/templates/data/resources.ts
import { appIDToPath } from "../../../utils/app-id-to-path.mjs";
var getDataResources = (params) => (
  /* xml */
  `
<?xml version="1.0" encoding="UTF-8"?>
<gresources>
  <gresource prefix="/${appIDToPath(params.appID)}">${params.files ? "\n" + params.files.map((f) => (
    /* xml */
    `    <file>${f}</file>`
  )).join("\n") : ""}
  </gresource>
</gresources>
`.trim()
);
export {
  getDataResources
};
