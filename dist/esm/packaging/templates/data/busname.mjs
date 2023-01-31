// src/packaging/templates/data/busname.ts
var getDataBusname = (params) => `
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
export {
  getDataBusname
};
