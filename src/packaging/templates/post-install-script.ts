export const getPostInstallScript = (params: { packageName: string }) =>
  /* py */ `
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
`.trim();
