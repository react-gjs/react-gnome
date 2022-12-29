export const getMainMesonBuild = (params: {
  appID: string;
  packageName: string;
  packageVersion: string;
}) =>
  `
project('${params.packageName}', 'c',
  version: '${params.packageVersion}',
  meson_version: '>= 0.50.0',
)

gnome = import('gnome')
intl = import('i18n')

dependency('glib-2.0')
dependency('gobject-introspection-1.0', version: '>=1.35.9')
dependency('gjs-1.0', version: '>= 1.71.0')

app_id = '${params.appID}'

gjs = find_program('gjs')
GETTEXT_PACKAGE = app_id

app_configuration = configuration_data()

app_configuration.set('GJS', gjs.path())
app_configuration.set('PACKAGE_NAME', app_id)
app_configuration.set('PACKAGE_VERSION', meson.project_version())
app_configuration.set('prefix', get_option('prefix'))

pkgdatadir = join_paths(get_option('datadir'), app_id)
app_configuration.set('libdir', join_paths(get_option('prefix'), get_option('libdir')))
app_configuration.set('pkgdatadir', pkgdatadir)

subdir('data')
subdir('src')
subdir('po')
meson.add_install_script('meson/meson_post_install.py')
`.trim();
