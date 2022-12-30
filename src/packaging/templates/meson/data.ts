export const getDataMesonBuild = () =>
  `
podir = join_paths(meson.source_root(), 'po')
app_datadir = get_option('datadir')

data_resource = gnome.compile_resources(
  '@0@.data'.format(app_id),
  '@0@.data.gresource.xml'.format(app_id),
  gresource_bundle: true,
  install: true,
  install_dir : pkgdatadir
)

# Installing the schema file
install_data(
  '@0@.gschema.xml'.format(app_id),
  install_dir: join_paths(app_datadir, 'glib-2.0', 'schemas')
)

# Building desktop file
msgfmt = find_program('msgfmt')
desktop = custom_target(
  'desktop-file',
  input : '@0@.desktop.in'.format(app_id),
  output : '@0@.desktop'.format(app_id),
  install: true,
  install_dir: join_paths(app_datadir, 'applications'),
  command: [msgfmt, '--desktop',
    '--template', '@INPUT@', '-d', podir, '-o', '@OUTPUT@',
    '--keyword=X-Geoclue-Reason',
    '--keyword=Name', '--keyword=Comment', '--keyword=Keywords'
  ]
)

# Validating desktop file
desktop_file_validate = find_program('desktop-file-validate', required:false)
if desktop_file_validate.found()
  test (
    'Validate desktop file',
    desktop_file_validate,
    args: join_paths(meson.current_build_dir(), app_id + '.desktop')
  )
endif

# Building app data
appdata = intl.merge_file(
  input: '@0@.appdata.xml.in'.format(app_id),
  output: '@0@.appdata.xml'.format(app_id),
  install: true,
  install_dir: join_paths(app_datadir, 'metainfo'),
  po_dir: podir
)

# Validating app data
appstream_util = find_program('appstream-util', required: false)
if appstream_util.found()
  test(
    'validate-appdata', appstream_util,
    args: [
      'validate-relax', '--nonet', appdata.full_path()
    ]
  )
endif

dbusservicedir = join_paths(get_option('datadir'), 'dbus-1', 'services')
dbus_service = configure_file(
  configuration: app_configuration,
  input: '@0@.service.in'.format(app_id),
  output: '@0@.service'.format(app_id),
  install: true,
  install_dir: dbusservicedir
)
`.trim();
