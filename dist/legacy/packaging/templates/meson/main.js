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

// src/packaging/templates/meson/main.ts
var main_exports = {};
__export(main_exports, {
  getMainMesonBuild: () => getMainMesonBuild
});
module.exports = __toCommonJS(main_exports);
var getMainMesonBuild = (params) => `
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
