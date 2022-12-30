export const getSrcMesonBuild = () =>
  `

application = configure_file(
  output : app_id,
  input : '@0@.in'.format(app_id),
  configuration: app_configuration,
  install: true,
  install_dir: pkgdatadir
)

application_resource = gnome.compile_resources(
  '@0@.src'.format(app_id),
  configure_file(
    input: '@0@.src.gresource.xml.in'.format(app_id),
    output: '@0@.src.gresource.xml'.format(app_id),
    configuration: app_configuration,
  ),
  gresource_bundle: true,
  install: true,
  install_dir : pkgdatadir
)

run_target('run', 
  command: application,
  depends: application_resource
)
`.trim();
