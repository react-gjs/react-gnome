// src/utils/validate-prefix.ts
var errInvalidPrefix = () => {
  throw new Error("Invalid application prefix.");
};
var validatePrefix = (prefix) => {
  const parts = prefix.split(".");
  if (parts.length === 0 || parts[0].length === 0) {
    return errInvalidPrefix();
  }
  for (const part of parts) {
    if (!part) {
      return errInvalidPrefix();
    }
    if (part.startsWith("-") || part.endsWith("-") || part.startsWith("_") || part.endsWith("_")) {
      return errInvalidPrefix();
    }
    if (/^[^\w\d_-]$/.test(part)) {
      return errInvalidPrefix();
    }
  }
  return prefix;
};
export {
  validatePrefix
};
