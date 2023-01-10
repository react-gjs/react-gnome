import { appIDToPath } from "../../../utils/app-id-to-path";

export const getDataGSchema = (params: { appID: string }) =>
  /* xml */ `
<?xml version="1.0" encoding="UTF-8"?>
<schemalist gettext-domain="${params.appID}">
  <schema id="${params.appID}" path="/${appIDToPath(params.appID)}/">
  </schema>
</schemalist>
`.trim();
