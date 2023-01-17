export const leftPad = (str: string, length: number, char = " ") => {
  char = char[0] ?? " ";
  const pad = char.repeat(length);
  const lines = str.split("\n");
  return lines.map((line) => `${pad}${line}`).join("\n");
};
