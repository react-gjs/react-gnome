// src/packaging/templates/data/gschema.ts
import { appIDToPath } from "../../../utils/app-id-to-path.mjs";
var getDataGSchema = (params) => (
  /* xml */
  `
<?xml version="1.0" encoding="UTF-8"?>
<schemalist gettext-domain="${params.appID}">
  <schema id="${params.appID}" path="/${appIDToPath(params.appID)}/">
  </schema>
</schemalist>
`.trim()
);
export {
  getDataGSchema
};
