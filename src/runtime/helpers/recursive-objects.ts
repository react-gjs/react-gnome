/**
 * Creates a copy of object without Circular References which breaks
 * JSON.stringify function.
 */
const copyWithoutRecursiveRefs = <T extends Record<string | number, any>>(
  references: object[],
  obj: T,
): object => {
  references.push(obj);
  let cleanObject: Record<string | number, any> = {};

  Object.keys(obj).forEach((key) => {
    var value = obj[key];
    if (value && typeof value === "object") {
      if (references.indexOf(value) < 0) {
        references.push(value);
        cleanObject[key] = copyWithoutRecursiveRefs(references, value);
        references.pop();
      } else {
        cleanObject[key] = "###_Recursive Reference_###";
      }
    } else if (typeof value !== "function") {
      cleanObject[key] = value;
    }
  });

  const proto = Object.getPrototypeOf(obj);
  if (proto) {
    Object.setPrototypeOf(cleanObject, proto);
  }

  return cleanObject;
};

export function removeRecursiveRefs<T extends Record<string | number, any>>(
  obj: T,
): object {
  return copyWithoutRecursiveRefs([], obj);
}
