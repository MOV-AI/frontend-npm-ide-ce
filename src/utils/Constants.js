import get from "lodash/get";

export const APP_DEFAULT_CONFIG = "app-ide-ce";
export const APP_CUSTOM_CONFIG = "app-custom-ide-ce";

export const MANAGER = "manager";

export const VERSION = get(window, "SERVER_DATA.Application.Version", "0.0.1");

export const SCOPES = {
  Callback: "Callback",
  Configuration: "Configuration",
  Flow: "Flow",
  Node: "Node"
};

//========================================================================================
/*                                                                                      *
 *                                   Layout Constants                                   *
 *                                                                                      */
//========================================================================================

export const HOMETAB_PROFILE = { name: "HomeTab", title: "Welcome" };

export const DEFAULT_TABS = new Map(Object.entries({[HOMETAB_PROFILE.name]: { id: HOMETAB_PROFILE.name }}));

export const DEFAULT_LAYOUT = {
  dockbox: {
    mode: "horizontal",
    children: [{tabs: [{
      id: HOMETAB_PROFILE.name,
    }]}]
  },
  windowbox: { children: [] },
  maxbox: { children: [] },
  floatbox: { children: [] }
};