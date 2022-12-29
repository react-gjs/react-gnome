export const getInFile = (params: { appID: string; appName: string }) =>
  `
#!@GJS@
imports.package.init({
    name: '${params.appID}',
    version: '@PACKAGE_VERSION@',
    prefix: '@prefix@',
    libdir: '@libdir@',
});
import('resource:///org/gnome/${params.appName}/js/main.js').catch(error => {
    console.error(error);
    imports.system.exit(1);
});
`.trim();
