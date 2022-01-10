/**
 * Generate random ID
 * @returns {String} Random ID in format : "1c76107c-146e-40bc-93fb-8148750cf50a"
 */
export const randomId = () => {
  return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
    (
      c ^
      (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))
    ).toString(16)
  );
};

/**
 * Get tab icon color for each document type
 * @param {string} scope : Document type (Callback, Configuration, ...)
 * @returns {string} Color by document type
 */
export const getTabIconColor = scope => {
  const TAB_ICON_COLORS = {
    Callback: "cadetblue",
    Layout: "darkred",
    Flow: "orchid",
    Node: "khaki",
    Configuration: "goldenrod"
  };
  // Return color by scope
  return scope in TAB_ICON_COLORS ? TAB_ICON_COLORS[scope] : "white";
};

/**
 * Document scopes
 */
export const SCOPES = {
  CALLBACK: "Callback",
  CONFIGURATION: "Configuration",
  NODE: "Node",
  FLOW: "Flow"
};

/**
 * Simple Event to Stop Propagation
 * @param e: event to stop the propagation
 */
export const stopPropagation = e => {
  e.stopPropagation();
}

/**
 * Returns the document name from an URL
 * @param {String} url
 * @returns {String}
 */
export function getNameFromURL(url) {
  console.log("url", url);
  return url?.substring(url.lastIndexOf("/") +1);
}
