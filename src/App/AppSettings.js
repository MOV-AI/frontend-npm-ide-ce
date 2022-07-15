import { KEYBINDINGS } from "../tools/AppShortcuts/shortcuts";
import Logo from "../Branding/movai-flow-logo-red.png";

const APPLICATION_DATA = window.SERVER_DATA?.Application;
const BRANDING = { NAME: "MOV.AI Flow™" };

const AppSettings = {
  NAME: BRANDING.NAME,
  LOGO: Logo,
  SHORTCUTS: KEYBINDINGS,
  HELP: {
    DOCUMENTATION: "https://flow.mov.ai/",
    FORUM: "https://forum.flow.mov.ai/"
  },
  APP_INFORMATION: {
    VERSION: APPLICATION_DATA?.Version || "0.0.1",
    LAST_UPDATE: APPLICATION_DATA?.LastUpdate || "-",
    CONFIGURATION_FILE: APPLICATION_DATA?.Configuration || "-",
    CUSTOM_CONFIGURATION_FILE: APPLICATION_DATA?.CustomConfiguration || "-",
    DESCRIPTION: APPLICATION_DATA?.Description || "-",
    LABEL: APPLICATION_DATA?.Label || BRANDING.NAME
  }
};

//========================================================================================
/*                                                                                      *
 *                                        Setters                                       *
 *                                                                                      */
//========================================================================================

export const setLogo = logo => {
  AppSettings.LOGO = logo;
};

export const setLinks = ({ documentation, forum }) => {
  AppSettings.HELP.DOCUMENTATION = documentation;
  AppSettings.HELP.FORUM = forum;
};

export const setName = name => {
  AppSettings.NAME = name;
  AppSettings.APP_INFORMATION.LABEL = name;
};

export const setShortcuts = (shortcuts, keepBase) => {
  const baseShortcuts = keepBase ? KEYBINDINGS : {};
  AppSettings.SHORTCUTS = { ...baseShortcuts, shortcuts };
};

export default AppSettings;
