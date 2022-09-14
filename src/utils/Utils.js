import { forwardRef } from "react";
import AccountTreeIcon from "@material-ui/icons/AccountTree";
import BuildIcon from "@material-ui/icons/Build";
import CodeIcon from "@material-ui/icons/Code";
import DescriptionIcon from "@material-ui/icons/Description";
import DeviceHubIcon from "@material-ui/icons/DeviceHub";
import KeyboardIcon from "@material-ui/icons/Keyboard";
import { Utils } from "@mov-ai/mov-fe-lib-core";
import movaiIcon from "../plugins/views/editors/_shared/Branding/movai-logo-white.png";
import { ERROR_MESSAGES } from "./Messages";
import { GLOBAL_WORKSPACE } from "./Constants";

/**
 * Export a non implemented empty function
 * @param {String} name : function name
 * @returns console.warn call with the function name
 */
export const defaultFunction = (name, logToConsole = true) => {
  if (logToConsole) console.warn(`${name} not implemented`);
};

/**
 * Checks if it's a React Component or Functional Component to return it's ref
 * @param {*} Component
 * @returns {Component} RefComponent
 */
export const getRefComponent = Component => {
  let RefComponent = Component;
  if (typeof Component === "function")
    RefComponent = forwardRef((props, ref) => Component(props, ref));

  return RefComponent;
};

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
  return scope in TAB_ICON_COLORS ? TAB_ICON_COLORS[scope] : "inherit";
};

/**
 * Get icon for each document type
 * @param {string} scope : Document type (Callback, Configuration, ...)
 * @returns {component} Icon by document type
 */
export const getIconByScope = (scope, style) => {
  scope = scope || "Default";
  const color = getTabIconColor(scope);
  const homeTabIcon = (
    <img src={movaiIcon} alt="MOV.AI Logo" style={{ maxWidth: 13, ...style }} />
  );
  const icon = {
    Callback: <CodeIcon style={{ color, ...style }} />,
    Layout: <i className={`icon-Layouts`} style={{ color, ...style }}></i>,
    Flow: <AccountTreeIcon style={{ color, ...style }} />,
    Annotation: <DescriptionIcon style={{ color, ...style }} />,
    GraphicScene: <DeviceHubIcon style={{ color, ...style }} />,
    Node: <i className={`icon-Nodes`} style={{ color, ...style }}></i>,
    Configuration: <BuildIcon style={{ color, ...style }} />,
    HomeTab: homeTabIcon,
    ShortcutsTab: <KeyboardIcon style={{ color, ...style }} />,
    Default: <></>
  };

  return icon[scope];
};

/**
 * Returns the document version from an URL
 * @param {String} url
 * @returns {String}
 */
export function getVersionFromUrl(url) {
  if (!url) return "";
  const splittedUrl = url.split("/");
  return splittedUrl[3];
}

/**
 * Returns the document name from an URL
 * @param {String} url
 * @returns {String}
 */
export function getNameFromURL(url) {
  if (!url) return "";
  const splittedUrl = url.split("/");
  return splittedUrl.length === 1 ? url : splittedUrl[2];
}

/**
 * Returns the document scope from an URL
 * @param {String} url
 * @returns {String}
 */
export function getScopeFromURL(url) {
  if (!url) return "";
  const splittedUrl = url.split("/");
  return splittedUrl[1];
}

/**
 * Returns the document workspace from an URL
 * @param {String} url
 * @returns {String}
 */
export function getWorkspaceFromUrl(url) {
  if (!url) return "";
  const splittedUrl = url.split("/");
  return splittedUrl[0];
}

/**
 * Validate document name and throw error if validation doesn't pass
 * @param {string} name : Document name
 * @returns {boolean}
 */
export function validateDocumentName(name) {
  if (!Utils.validateEntityName(name)) {
    throw new Error(ERROR_MESSAGES.INVALID_NAME);
  } else {
    return true;
  }
}

/**
 * Build a document path from a doc
 * @param {Document} doc
 * @returns
 */
export function buildDocPath(doc) {
  const { scope, name } = doc;
  const workspace = doc.workspace ?? GLOBAL_WORKSPACE;
  return `${workspace}/${scope}/${name}`;
}

const boolToPythonOptions = {
  true: "True",
  false: "False"
};

const PythonToBoolOptions = {
  True: true,
  False: false
};

/**
 * Convert boolean to Python string
 * @param {boolean} value
 * @returns {string} : A string representing a Python boolean
 */
export function isValidPythonBool(value) {
  return value in boolToPythonOptions;
}

/**
 * Convert boolean to Python string
 * @param {boolean} value
 * @returns {string} : A string representing a Python boolean
 */
export function boolToPython(value) {
  return boolToPythonOptions[value] ?? boolToPythonOptions[false];
}

/**
 * Convert from Python string to boolean
 * @param {string} value : A string representing a Python boolean
 * @returns {boolean}
 */
export function pythonToBool(value) {
  return PythonToBoolOptions[value];
}

export function parseKeybinds(shortcuts, sep = ",") {
  let parsedShortcuts = shortcuts;
  if (Array.isArray(parsedShortcuts)) parsedShortcuts = shortcuts.join(sep);

  return parsedShortcuts;
}

/**
 * Simple Event to Stop Propagation
 * @param e: event to stop the propagation
 */
export function stopPropagation(e) {
  e?.stopPropagation();
}

/**
 * Trigger a simulated mouse click (react element)
 * @param {*} element
 */
export function simulateMouseClick(element) {
  ["mousedown", "click", "mouseup"].forEach(mouseEventType =>
    element.dispatchEvent(
      new MouseEvent(mouseEventType, {
        view: window,
        bubbles: true,
        cancelable: true,
        buttons: 1
      })
    )
  );
}

/**
 * Trigger callback before unload app
 * @param {function} callback
 */
export function runBeforeUnload(callback) {
  // Previous beforeunload method
  const onAppUnload = window.onbeforeunload;
  // Set new beforeunload method with given callback
  window.onbeforeunload = event => {
    callback && callback(event);
    return onAppUnload(event);
  };
}
