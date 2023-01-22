export const getEntryFile = () =>
  /* ts */ `
import React from "react";
import {
  Align,
  Markup,
  render,
  ScrollBox,
  Span,
  Window,
} from "react-gjs-renderer";
import "react-gnome";
import env from "gapp:env";

render(
    <Window quitAppOnClose title="React Gnome App">
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
    {
      appId: env.appId,
    }
);
`.trim() + "\n";
