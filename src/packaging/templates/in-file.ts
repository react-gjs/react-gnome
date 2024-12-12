import { appIDToPath } from "../../utils/app-id-to-path";

export const getInFile = (params: { appID: string }) =>
  /* js */ `
#!@GJS@ -m

imports.package.init({
    name: '${params.appID}',
    version: '@PACKAGE_VERSION@',
    prefix: '@prefix@',
    libdir: '@libdir@',
});

Object.assign(globalThis, {
  MAIN_LOOP_NAME: "react-gtk-app:main-loop"
});

import('resource:///${appIDToPath(params.appID)}/js/main.js')
  .then((main) => {
    imports.package.run(main)
  })
  .catch(error => {
    console.error(error);
    imports.system.exit(1);
  });

// Main Loop must be started from this entry file, or otherwise all Promises block until main loop exits
// See https://gitlab.gnome.org/GNOME/gjs/-/issues/468 for more details
imports.mainloop.run(MAIN_LOOP_NAME);
`.trim();
