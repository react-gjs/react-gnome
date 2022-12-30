export const getGResourceXml = (params: {
  appName: string;
  files?: string[];
}) =>
  /* xml */ `
<?xml version="1.0" encoding="UTF-8"?>
<gresources>
  <gresource prefix="/org/gnome/${params.appName}/js">
    <file>main.js</file>${
      params.files
        ? "\n" +
          params.files.map((f) => /* xml */ `<file>${f}</file>`).join("\n")
        : ""
    }
  </gresource>
</gresources>
`.trim();
