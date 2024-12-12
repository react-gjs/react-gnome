export const getJsEntryFile = () =>
  /* ts */ `
import React from "react";
import {
  Markup,
  Renderer,
  Span,
  Window,
} from "@reactgjs/renderer";
import "@reactgjs/react-gtk";
import env from "gapp:env";

new Renderer({ appId: env.appId }).start(
    <Window
      minWidth={800}
      minHeight={600}
      quitOnClose
      title="Sample React GTK App"
    >
        <Markup>
          <Span fontSize={32}>Sample React GTK App</Span>
        </Markup>
    </Window>,
);
`.trim() + "\n";
