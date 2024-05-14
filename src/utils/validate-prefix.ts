const errInvalidPrefix = () => {
  throw new Error("Invalid application prefix.");
};

export const validatePrefix = (prefix: string) => {
  const parts = prefix.split(".");

  if (parts.length === 0 || parts[0]!.length === 0) {
    return errInvalidPrefix();
  }

  for (const part of parts) {
    if (!part) {
      return errInvalidPrefix();
    }

    if (
      part.startsWith("-")
      || part.endsWith("-")
      || part.startsWith("_")
      || part.endsWith("_")
    ) {
      return errInvalidPrefix();
    }

    if (/^[^\w\d_-]$/.test(part)) {
      return errInvalidPrefix();
    }
  }

  return prefix;
};
