export const getMainMesonBuild = (params: {
  appID: string;
  packageName: string;
  packageVersion: string;
  license: string;
}) =>
  `
project('${params.packageName}', 'c',
  version: '${params.packageVersion}',
  meson_version: '>= 0.50.0',
  license: '${params.license}'
)

gnome = import('gnome')
intl = import('i18n')

dependency('glib-2.0')
dependency('gobject-introspection-1.0', version: '>=1.35.9')
dependency('gjs-1.0', version: '>= 1.70.0')

app_id = '${params.appID}'

gjs = find_program('gjs')
GETTEXT_PACKAGE = app_id

app_configuration = configuration_data()

app_prefix = get_option('prefix')
app_libdir = join_paths(app_prefix, get_option('libdir'))
app_bindir = join_paths(app_prefix, get_option('bindir'))
app_datadir = join_paths(app_prefix, join_paths(get_option('datadir'), app_id))
pkgdatadir = join_paths(get_option('datadir'), app_id)

app_configuration.set('GJS', gjs.path())
app_configuration.set('VERSION', meson.project_version())
app_configuration.set('APP_ID', app_id)
app_configuration.set('PACKAGE_NAME', app_id)
app_configuration.set('PACKAGE_VERSION', meson.project_version())
app_configuration.set('DATA_DIR', app_datadir)
app_configuration.set('prefix', app_prefix)
app_configuration.set('libdir', app_libdir)
app_configuration.set('pkgdatadir', pkgdatadir)

subdir('data')
subdir('src')
subdir('po')

meson.add_install_script(
  'meson/meson_post_install.py',
  get_option('datadir'),
  pkgdatadir,
  app_bindir,
  app_id
)
`.trim();
