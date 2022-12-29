export const getDataResources = (params: {
  appName: string;
  files?: string[];
}) =>
  /* xml */ `
<?xml version="1.0" encoding="UTF-8"?>
<gresources>
  <gresource prefix="/org/gnome/${params.appName}">
  ${
    params.files
      ? params.files.map((f) => /* xml */ `<file>${f}</file>`).join("\n")
      : ""
  }
  </gresource>
</gresources>
`.trim();
