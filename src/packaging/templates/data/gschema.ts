export const getDataGSchema = (params: { appID: string; appName: string }) =>
  /* xml */ `
<?xml version="1.0" encoding="UTF-8"?>
<schemalist gettext-domain="${params.appID}">
  <schema id="${params.appID}" path="/org/gnome/${params.appName}/">
  </schema>
</schemalist>
`.trim();
