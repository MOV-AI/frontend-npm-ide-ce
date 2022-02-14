// https://github.com/30-seconds/30-seconds-of-code/blob/master/snippets/flattenObject.md
export function flattenObject(obj, prefix = "", separator = ".") {
  return Object.keys(obj).reduce((acc, k) => {
    const pre = prefix.length ? prefix + separator : "";
    if (typeof obj[k] === "object")
      Object.assign(acc, flattenObject(obj[k], pre + k, separator));
    else acc[pre + k] = obj[k];
    return acc;
  }, {});
}
