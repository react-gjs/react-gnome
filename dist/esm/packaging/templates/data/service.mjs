// src/packaging/templates/data/service.ts
var getDataService = () => `
[D-BUS Service]
Name=@PACKAGE_NAME@
Exec=@DATA_DIR@/@PACKAGE_NAME@ --gapplication-service
`.trim();
export {
  getDataService
};
