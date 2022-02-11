import AccountTreeIcon from "@material-ui/icons/AccountTree";
import BuildIcon from "@material-ui/icons/Build";
import CodeIcon from "@material-ui/icons/Code";
import DescriptionIcon from "@material-ui/icons/Description";
import DeviceHubIcon from "@material-ui/icons/DeviceHub";
import { Utils } from "@mov-ai/mov-fe-lib-core";
import movaiIcon from "../plugins/views/editors/_shared/Loader/movai_red.svg";

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
    <img src={movaiIcon} alt="MOV.AI Logo" style={{ maxWidth: 12, ...style }} />
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
    Default: <></>
  };

  return icon[scope];
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
  e?.stopPropagation();
};

/**
 * Returns the document name from an URL
 * @param {String} url
 * @returns {String}
 */
export function getNameFromURL(url) {
  return url?.substring(url.lastIndexOf("/") + 1);
}

/**
 * Validate document name and throw error if validation doesn't pass
 * @param {string} name : Document name
 * @returns {boolean}
 */
export function validateDocumentName(name) {
  if (!Utils.validateEntityName(name)) {
    throw new Error("Invalid name");
  } else {
    return true;
  }
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
