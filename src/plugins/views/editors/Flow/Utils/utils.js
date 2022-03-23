//========================================================================================
/*                                                                                      *
 *                                    Private Methods                                   *
 *                                                                                      */
//========================================================================================

/**
 * @private Parse document path
 * @param {string} path : Document path
 * @returns {string} Uniform document path
 */
const parseDocumentPath = path => {
  const splittedPath = path.split("/");
  const version = splittedPath[3] || "-";
  const basePath = splittedPath.slice(0, 3).join("/");

  return ["__UNVERSIONED__", "-"].includes(version)
    ? `${basePath}/-`
    : `${basePath}/${version}`;
};


//========================================================================================
/*                                                                                      *
 *                                    Public Methods                                    *
 *                                                                                      */
//========================================================================================


/**
 * Flatten object
 * @param {*} obj 
 * @param {*} prefix 
 * @param {*} separator 
 * @returns 
 */
export function flattenObject(obj, prefix = "", separator = ".") {
  return Object.keys(obj).reduce((acc, k) => {
    const pre = prefix.length ? prefix + separator : "";
    if (typeof obj[k] === "object")
      Object.assign(acc, flattenObject(obj[k], pre + k, separator));
    else acc[pre + k] = obj[k];
    return acc;
  }, {});
}

/**
 * Compare document path
 * @param {string} path1 : Document path 1
 * @param {string} path2 : Document path 2
 * @returns {boolean} True if is the same document path, False otherwise
 */
export const compareDocumentPaths = (path1, path2) => {
  if (path1 === path2) return true;
  const parsedPath1 = parseDocumentPath(path1);
  const parsedPath2 = parseDocumentPath(path2);

  return parsedPath1 === parsedPath2;
};
