export const getTsEntryFile = () =>
  /* ts */ `
import React from "react";
import {
  Markup,
  Renderer,
  Span,
  Window,
} from "@reactgjs/react-gtk";
import env from "gapp:env";

function App() {
  return (
    <Window
      minWidth={800}
      minHeight={600}
      quitOnClose
      title="Sample React GTK App"
    >
        <Markup>
          <Span fontSize={32}>Sample React GTK App</Span>
        </Markup>
    </Window>
  );
}

new Renderer({ appId: env.appId }).start(<App />);
`.trim() + "\n";
