// src/packaging/templates/data/desktop-entry.ts
var getDataDesktopEntry = (params) => `
[Desktop Entry]
Type=Application
Name=${params.friendlyName}
Icon=${params.appID}
Exec=gapplication launch ${params.appID}
DBusActivatable=true
StartupNotify=true
Keywords=${["gtk", "gjs", ...params.keywords ?? []].join(";")};
`.trim();
export {
  getDataDesktopEntry
};
