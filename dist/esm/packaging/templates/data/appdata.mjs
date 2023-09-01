// src/packaging/templates/data/appdata.ts
var getAppData = (params) => (
  /* xml */
  `
<?xml version="1.0" encoding="UTF-8"?>
<component type="desktop">
  <id>${params.appID}</id>
  <name>${params.friendlyName}</name>
  <licence>${params.license}</licence>
  <project_group>GNOME</project_group>
  <launchable type="desktop-id">${params.appID}.desktop</launchable>
  <description>
  </description>
</component>
`.trim()
);
export {
  getAppData
};
