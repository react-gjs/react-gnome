//
/// <reference path="../../node_modules/react-gjs-renderer/dist/gjs-declarations/Atk.d.ts" />;
/// <reference path="../../node_modules/react-gjs-renderer/dist/gjs-declarations/Cairo.d.ts" />;
/// <reference path="../../node_modules/react-gjs-renderer/dist/gjs-declarations/Gdk.d.ts" />;
/// <reference path="../../node_modules/react-gjs-renderer/dist/gjs-declarations/GdkPixbuf.d.ts" />;
/// <reference path="../../node_modules/react-gjs-renderer/dist/gjs-declarations/Gio.d.ts" />;
/// <reference path="../../node_modules/react-gjs-renderer/dist/gjs-declarations/GLib.d.ts" />;
/// <reference path="../../node_modules/react-gjs-renderer/dist/gjs-declarations/GModule.d.ts" />;
/// <reference path="../../node_modules/react-gjs-renderer/dist/gjs-declarations/GObject.d.ts" />;
/// <reference path="../../node_modules/react-gjs-renderer/dist/gjs-declarations/Gtk.d.ts" />;
/// <reference path="../../node_modules/react-gjs-renderer/dist/gjs-declarations/Pango.d.ts" />;
/// <reference path="../../node_modules/react-gjs-renderer/dist/gjs-declarations/Soup.d.ts" />;

declare module "gi://Atk" {}
declare module "gi://cairo" {}
declare module "gi://Gdk" {}
declare module "gi://GdkPixbuf" {}
declare module "gi://Gio" {}
declare module "gi://GLib" {}
declare module "gi://GModule" {}
declare module "gi://GObject" {}
declare module "gi://Gtk" {}
declare module "gi://Pango" {}
declare module "gi://Soup" {}

declare module "gi://Gtk?version=3.0" {
  export * from "gi://Gtk";
}

declare module "gi://Gdk?version=3.0" {
  export * from "gi://Gdk";
}
