import path from "path-gjsify";
import type { Segment } from "./base64-vlq";
import { Base64VLQ } from "./base64-vlq";

export type SourceMap = {
  version: number;
  sources: string[];
  sourcesContent: string[];
  mappings: string;
  names: string[];
};

export type FileLocation = {
  file: string | undefined;
  line: number;
  column: number;
  symbolName?: string | undefined;
};

type MapState = [
  outColumn: number,
  file: number,
  line: number,
  column: number,
  nameIndex: number,
];

export class SourceMapReader {
  private converter = new Base64VLQ();

  constructor(
    private map: SourceMap,
    private mapFilepath: string,
  ) {}

  protected getFile(file?: number) {
    if (file === undefined) return undefined;

    const rel = this.map.sources[file];

    if (!rel) return undefined;

    return path.join(path.dirname(this.mapFilepath), rel);
  }

  protected getLineN(text: string, n: number) {
    let line = 0;
    let lineStart = 0;

    while (line !== n) {
      lineStart = text.indexOf("\n", lineStart) + 1;
      line++;
    }

    if (line > 0 && lineStart === 0) {
      return "";
    }

    let lineEnd = text.indexOf("\n", lineStart + 1);

    if (lineEnd === -1) {
      lineEnd = text.length;
    }

    return text.slice(lineStart, lineEnd);
  }

  getOriginalPosition(outLine: number, outColumn: number): FileLocation | null {
    // SourceMap is 0 based, error stack is 1 based
    outLine -= 1;
    outColumn -= 1;

    const vlqs = this.map.mappings.split(";").map((line) => line.split(","));

    const state: MapState = [0, 0, 0, 0, 0];

    if (vlqs.length <= outLine) return null;

    for (let index = 0; index < vlqs.length; index++) {
      const line = vlqs[index]!;
      state[0] = 0;

      let prevSegment: Segment = [0];

      for (let i = 0; i < line.length; i++) {
        const segment = line[i];
        if (!segment) continue;
        const decodedSegment = this.converter.decode(segment);

        const prevState = state.slice() as MapState;

        state[0] += decodedSegment[0];

        if (decodedSegment.length > 1) {
          state[1] += decodedSegment[1] ?? 0;
          state[2] += decodedSegment[2] ?? 0;
          state[3] += decodedSegment[3] ?? 0;
          state[4] += decodedSegment[4] ?? 0;

          if (index === outLine) {
            const currentOutCol = state[0];
            const prevOutCol = prevState[0];

            if (currentOutCol === outColumn) {
              return {
                file: this.getFile(state[1]),
                line: state[2] + 1,
                column: state[3] + 1,
                symbolName: decodedSegment[4] != null
                  ? this.map.names[state[4]]
                  : undefined,
              };
            } else if (outColumn >= prevOutCol && outColumn <= currentOutCol) {
              return {
                file: this.getFile(state[1]),
                line: state[2] + 1,
                column: prevState[3] + 1,
                symbolName: prevSegment[4] != null
                  ? this.map.names[prevState[4]]
                  : undefined,
              };
            }
          }
        }

        prevSegment = decodedSegment;
      }

      if (index === outLine) {
        return {
          file: this.getFile(state[1]),
          line: state[2] + 1, // back to 1 based
          column: 1,
        };
      }
    }

    return null;
  }
}
