export const getEntryFile = () =>
  /* ts */ `
import React from "react";
import {
  Align,
  Markup,
  Renderer,
  ScrollBox,
  Span,
  Window,
} from "@reactgjs/renderer";
import "react-gnome";
import env from "gapp:env";

new Renderer({ appId: env.appId }).start(
    <Window quitOnClose title="React Gnome App">
      <ScrollBox
        useChildHeight
        useChildWidth
        verticalAlign={Align.CENTER}
        horizontalAlign={Align.CENTER}
        margin={[150, 100]}
      >
        <Markup>
          <Span fontSize={32}>React Gnome App</Span>
        </Markup>
      </ScrollBox>
    </Window>,
);
`.trim() + "\n";
