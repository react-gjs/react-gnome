export const pascalToKebab = (str: string) =>
  (str[0]!.toLowerCase() + str.slice(1))
    .replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, "$1-$2")
    .toLowerCase();
