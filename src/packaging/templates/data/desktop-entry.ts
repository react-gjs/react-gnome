export const getDataDesktopEntry = (params: {
  friendlyName: string;
  appID: string;
  keywords?: string[];
}) =>
  `
[Desktop Entry]
Type=Application
Name=${params.friendlyName}
Icon=${params.appID}
Exec=gapplication launch ${params.appID}
DBusActivatable=true
StartupNotify=true
Keywords=${["gtk", "gjs", ...(params.keywords ?? [])].join(";")};
`.trim();
