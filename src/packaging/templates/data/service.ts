export const getDataService = () =>
  `
[D-BUS Service]
Name=@PACKAGE_NAME@
Exec=@DATA_DIR@/@PACKAGE_NAME@ --gapplication-service
`.trim();
