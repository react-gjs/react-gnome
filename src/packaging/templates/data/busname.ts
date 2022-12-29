export const getDataBusname = (params: {
  appID: string;
  documentationUrl?: string;
}) =>
  `
[Unit]
# Optional
Description=${params.appID}
# Optional (obviously)
Documentation=${params.documentationUrl ?? "https://github.com"}

[BusName]
# Optional
Name=${params.appID}
# Optional
Service=${params.appID}.service
`.trim();
