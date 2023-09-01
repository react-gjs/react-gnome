// src/utils/left-pad.ts
var leftPad = (str, length, char = " ") => {
  char = char[0] ?? " ";
  const pad = char.repeat(length);
  const lines = str.split("\n");
  return lines.map((line) => `${pad}${line}`).join("\n");
};
export {
  leftPad
};
