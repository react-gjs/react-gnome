const fs = require("fs");
const path = require("path");

const leftPad = (str, length, char = " ") => {
  char = char[0] ?? " ";
  const pad = char.repeat(length);
  const lines = str.split("\n");
  return lines.map((line) => `${pad}${line}`).join("\n");
};

const logDirs = fs
  .readdirSync("/tmp")
  .filter((dirname) => dirname.startsWith("xfs-"));

let errLogFound = false;

for (const logDir of logDirs) {
  const dirPath = path.resolve("/tmp", logDir);
  const logfiles = fs.readdirSync(dirPath);
  for (const logfileName of logfiles) {
    try {
      errLogFound = true;
      const filepath = path.resolve(dirPath, logfileName);
      const logfile = fs.readFileSync(filepath, "utf8");
      console.log("=".repeat(80));
      console.log("LOG:" + filepath + ":");
      console.log(leftPad(logfile, 2));
    } catch (e) {}
  }
}

if (!errLogFound) {
  console.log("No error logs found");
} else {
  process.exit(1);
}
