export const getDataGSchema = (params: { appID: string; appName: string }) =>
  `
<schemalist gettext-domain="${params.appID}">
  <schema id="${params.appID}" path="/org/gnome/${params.appName}/">
  </schema>
</schemalist>
`.trim();
