import AccountTreeIcon from "@material-ui/icons/AccountTree";
import BuildIcon from "@material-ui/icons/Build";
import CodeIcon from "@material-ui/icons/Code";
import DescriptionIcon from "@material-ui/icons/Description";
import DeviceHubIcon from "@material-ui/icons/DeviceHub";
import movaiIcon from "../plugins/views/editors/_shared/Loader/movai_red.svg";
import { HOMETAB_PROFILE } from "./Constants";
import HomeTab from "../plugins/views/HomeTab/HomeTab";

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
 * Get icon for each document type
 * @param {string} scope : Document type (Callback, Configuration, ...)
 * @returns {component} Icon by document type
 */
export const getIconByScope = (scope = "Default", style = {}) => {
  const color = getTabIconColor(scope);
  const icon = {
    Callback: <CodeIcon style={{ color, ...style }} />,
    Layout: <i className={`icon-Layouts`} style={{ color, ...style }}></i>,
    Flow: <AccountTreeIcon style={{ color, ...style }} />,
    Annotation: <DescriptionIcon style={{ color, ...style }} />,
    GraphicScene: <DeviceHubIcon style={{ color, ...style }} />,
    Node: <i className={`icon-Nodes`} style={{ color, ...style }}></i>,
    Configuration: <BuildIcon style={{ color, ...style }} />,
    HomeTab: (
      <img
        src={movaiIcon}
        alt="MOV.AI Logo"
        style={{ maxWidth: 12, ...style }}
      />
    ),
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
  console.log("url", url);
  return url?.substring(url.lastIndexOf("/") + 1);
}

/**
 * Gets the HomeTab Plugin
 * @private
 * @returns {Promise} the HomeTab
 */
export const getHomeTab = () => {
  const viewPlugin = new HomeTab(HOMETAB_PROFILE);

  return Promise.resolve({
    ...HOMETAB_PROFILE,
    id: HOMETAB_PROFILE.name,
    name: HOMETAB_PROFILE.title,
    tabTitle: HOMETAB_PROFILE.title,
    scope: HOMETAB_PROFILE.name,
    extension: "",
    content: viewPlugin.render()
  });
};
