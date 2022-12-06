// index.ts
import Gtk2 from "gi://Gtk";

// app.ts
import Gtk from "gi://Gtk";
var App = () => {
  Gtk.start();
};

// index.ts
Gtk2.init(null);
App();
