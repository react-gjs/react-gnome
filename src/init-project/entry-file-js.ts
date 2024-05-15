export const getJsEntryFile = () =>
  /* ts */ `
import React from "react";
import {
  Markup,
  Renderer,
  Span,
  Window,
} from "@reactgjs/renderer";
import "@reactgjs/react-gnome";
import env from "gapp:env";

new Renderer({ appId: env.appId }).start(
    <Window
      minWidth={800}
      minHeight={600}
      quitOnClose 
      title="Sample React Gnome App"
    >
        <Markup>
          <Span fontSize={32}>Sample React Gnome App</Span>
        </Markup>
    </Window>,
);
`.trim() + "\n";
