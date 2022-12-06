import type { GiVersions } from "../config/config-schema";

class GiImport {
  constructor(private name: string) {}

  get(version?: string) {
    return `import ${this.name} from "gi://${this.name}${
      version ? `?version=${version}` : ""
    }";`;
  }
}

const Gtk = new GiImport("Gtk");
const Gdk = new GiImport("Gdk");
const Gio = new GiImport("Gio");
const GLib = new GiImport("GLib");
const GObject = new GiImport("GObject");
const Pango = new GiImport("Pango");
const Atk = new GiImport("Atk");
const GModule = new GiImport("GModule");
const GdkPixbuf = new GiImport("GdkPixbuf");
const Cally = new GiImport("Cally");
const Clutter = new GiImport("Clutter");
const ClutterX11 = new GiImport("ClutterX11");
const Cogl = new GiImport("Cogl");
const Graphene = new GiImport("Graphene");
const Gst = new GiImport("Gst");
const HarfBuzz = new GiImport("HarfBuzz");
const Soup = new GiImport("Soup");
const cairo = new GiImport("cairo");
const xlib = new GiImport("xlib");

export const getDefaultGiImports = (versions: GiVersions = {}) =>
  [
    Gtk.get(versions.Gtk ?? "3.0"),
    Gdk.get(versions.Gdk),
    Gio.get(versions.Gio),
    GLib.get(versions.GLib),
    GObject.get(versions.GObject),
    Pango.get(versions.Pango),
    Atk.get(versions.Atk),
    GModule.get(versions.GModule),
    GdkPixbuf.get(versions.GdkPixbuf),
    Cally.get(versions.Cally),
    Clutter.get(versions.Clutter),
    ClutterX11.get(versions.ClutterX11),
    Cogl.get(versions.Cogl),
    Graphene.get(versions.Graphene),
    Gst.get(versions.Gst),
    HarfBuzz.get(versions.HarfBuzz),
    Soup.get(versions.Soup),
    cairo.get(versions.cairo),
    xlib.get(versions.xlib),
  ].join("\n");
