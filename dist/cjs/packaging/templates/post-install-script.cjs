"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/packaging/templates/post-install-script.ts
var post_install_script_exports = {};
__export(post_install_script_exports, {
  getPostInstallScript: () => getPostInstallScript
});
module.exports = __toCommonJS(post_install_script_exports);
var getPostInstallScript = (params) => (
  /* py */
  `
#!/usr/bin/env python3

import os
import pathlib
import subprocess
import sys

destdir = os.environ.get('DESTDIR', '')
datadir = sys.argv[1]
pkgdatadir = sys.argv[2]
bindir = os.path.join(destdir + os.sep + sys.argv[3])
app_id = sys.argv[4]

if not os.path.exists(bindir):
    os.makedirs(bindir)

src = os.path.join(pkgdatadir, app_id)
dest = os.path.join(bindir, '${params.packageName}')
subprocess.call(['ln', '-s', '-f', src, dest])

if not destdir:
    print("Installing new Schemas")
    subprocess.call(['glib-compile-schemas', os.path.join(datadir, 'glib-2.0/schemas')])
    print('Updating icon cache...')
    subprocess.call(['gtk-update-icon-cache', '-qtf', os.path.join(datadir, 'icons', 'hicolor')])
`.trim()
);
