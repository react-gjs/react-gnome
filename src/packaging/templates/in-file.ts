export const getInFile = (params: { appID: string; appName: string }) =>
  /* js */ `
#!@GJS@

imports.package.init({
    name: '${params.appID}',
    version: '@PACKAGE_VERSION@',
    prefix: '@prefix@',
    libdir: '@libdir@',
});

import('resource:///org/gnome/${params.appName}/js/main.js')
  .then((entrypoint) => {
    entrypoint.main();
  })
  .catch(error => {
    console.error(error);
    imports.system.exit(1);
  });

// Main Loop must be started from this entry file, or otherwise all Promises block until main loop exits
// See https://gitlab.gnome.org/GNOME/gjs/-/issues/468 for more details
imports.mainloop.run();
`.trim();
