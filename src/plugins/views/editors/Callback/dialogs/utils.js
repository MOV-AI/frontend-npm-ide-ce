//========================================================================================
/*                                                                                      *
 *                                   Public constants                                   *
 *                                                                                      */
//========================================================================================

export const EXCLUDED_PATHS = ["functions", "consts", "classes"];

//========================================================================================
/*                                                                                      *
 *                                 Private methods                                      *
 *                                                                                      */
//========================================================================================

/**
 * Normalize strings (make search case insensitive)
 * @param {string} str : String to be normalized
 * @returns {string} Normalized string
 */
const _normalizeString = str => {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
};

/**
 * Search in inner keys (functions, consts, classes)
 *  This function is implemented to comply with SonarLint rule:
 *    Cognitive Complexity of functions should not be too high (javascript:S3776)
 * @param {*} result : Current search result
 * @param {*} value : Normalized search value
 * @param {*} allImports : All imports
 * @param {*} key : Iteration key
 * @returns Search result
 */
const _searchInnerKeys = (result, value, allImports, key) => {
  let _children = {};
  let aux = {};
  let found = false;

  // if has modules
  if (allImports[key].modules !== undefined) {
    _children = searchImports(value, allImports[key].modules);
  }

  EXCLUDED_PATHS.forEach(x => {
    const array =
      x in allImports[key]
        ? allImports[key][x].filter(elem =>
            _normalizeString(elem).includes(value)
          )
        : [];
    if (array.length > 0) {
      aux[x] = array;
      found = true;
    }
  });
  if (Object.keys(_children).length > 0) {
    aux["modules"] = _children;
  }
  if (found || Object.keys(_children).length > 0) {
    result[key] = aux;
  }
  return result;
};

//========================================================================================
/*                                                                                      *
 *                                  Search Messages                                     *
 *                                                                                      */
//========================================================================================

/**
 * Search messages
 * @param {string} value : Search value
 * @param {array} allMessages : All messages available
 * @returns {array} Filtered messages by search value
 */
export const searchMessages = (value, allMessages) => {
  if (!value) return allMessages;
  else {
    let result = [];
    value = _normalizeString(value);
    allMessages.forEach(elem => {
      if (_normalizeString(elem.text).includes(value)) {
        result.push(elem);
      } else {
        // If has children
        if (elem.children !== undefined) {
          const _children = elem.children.filter(el =>
            _normalizeString(el.text).includes(value)
          );
          if (_children.length > 0) {
            result.push({
              text: elem.text,
              children: _children
            });
          }
        }
      }
    });
    return result;
  }
};

//========================================================================================
/*                                                                                      *
 *                                  Search Imports                                      *
 *                                                                                      */
//========================================================================================

/**
 * Search imports
 * @param {string} value : Search value
 * @param {object} allImports : All libraries available
 * @returns {object} Filtered libraries by search value
 */
export const searchImports = (value, allImports) => {
  // Clear search value => return full object
  if (!value) return allImports;
  // Has search value => Filter by value
  let result = {};
  value = _normalizeString(value);
  Object.keys(allImports).forEach(key => {
    if (_normalizeString(key).includes(value)) {
      result[key] = allImports[key];
    } else {
      result = _searchInnerKeys(result, value, allImports, key);
    }
  });
  return result;
};
