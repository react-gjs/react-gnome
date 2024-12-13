// src/runtime/helpers/recursive-objects.ts
var copyWithoutRecursiveRefs = (references, obj) => {
  references.push(obj);
  let cleanObject = {};
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
function removeRecursiveRefs(obj) {
  return copyWithoutRecursiveRefs([], obj);
}
export {
  removeRecursiveRefs
};
