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

export const TOPICS = {
  RIGHT_DRAWER: {
    CHANGE_BOOKMARK: "changeBookmark",
    ADD_BOOKMARK: "addBookmark",
    SET_BOOKMARK: "setBookmark",
    REMOVE_BOOKMARK: "removeBookmark",
  }, 
}

export const DEFAULT_KEY_VALUE_DATA = {
  name: "",
  description: "",
  type: "any",
  value: ""
};

export const DOC_VALID_NAMES = new RegExp(/^[\w][0-9A-Za-z-]*(_[0-9A-Za-z-]+)*[_]?$/);

export const ROS_VALID_NAMES = new RegExp(
  /(?!.*__.*)^[a-zA-Z~/]{1}?[a-zA-Z0-9_/]*$/
);

//========================================================================================
/*                                                                                      *
 *                                   Layout Constants                                   *
 *                                                                                      */
//========================================================================================

export const DOCK_POSITIONS = {
  DOCK: "dockbox",
  WINDOW: "windowbox",
  MAX: "maxbox",
  FLOAT: "floatbox",
}

export const FLOW_EXPLORER_PROFILE = { name: "FlowExplorer", title: "Flow Explorer" };

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