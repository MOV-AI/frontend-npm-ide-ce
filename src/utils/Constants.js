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
    REMOVE_BOOKMARK: "removeBookmark"
  }
};

export const PLUGINS = {
  DOC_MANAGER: {
    NAME: "docManager",
    CALL: {
      READ: "read",
      BROADCAST: "broadcast"
    },
    ON: {
      FLOW_EDITOR: "flowEditor",
      UPDATE_DOC_DIRTY: "updateDocDirty",
      DELETE_DOC: "deleteDoc",
      UPDATE_DOCS: "updateDocs",
      LOAD_DOCS: "loadDocs",
      SAVE_DOC: "saveDoc"
    }
  },
  TABS: { NAME: "tabs", CALL: { OPEN_EDITOR: "openEditor" } },
  RIGHT_DRAWER: {
    NAME: "rightDrawer",
    CALL: {
      ADD_BOOKMARK: "addBookmark",
      SET_BOOKMARK: "setBookmark",
      REMOVE_BOOKMARK: "removeBookmark"
    },
    ON: {
      CHANGE_BOOKMARK: "changeBookmark"
    }
  },
  DIALOG: {
    NAME: "dialog",
    CALL: {
      NEW_DOC: "newDocument",
      CONFIRMATION: "confirmation",
      ALERT: "alert"
    }
  },
  FLOW_EXPLORER: {
    NAME: "FlowExplorer",
    CALL: {},
    ON: { ADD_NODE: "addNode" }
  }
};

//========================================================================================
/*                                                                                      *
 *                                   Layout Constants                                   *
 *                                                                                      */
//========================================================================================

export const DOCK_POSITIONS = {
  DOCK: "dockbox",
  WINDOW: "windowbox",
  MAX: "maxbox",
  FLOAT: "floatbox"
};

export const FLOW_EXPLORER_PROFILE = {
  name: "FlowExplorer",
  title: "Flow Explorer"
};

export const HOMETAB_PROFILE = { name: "HomeTab", title: "Welcome" };

export const DEFAULT_TABS = new Map(
  Object.entries({ [HOMETAB_PROFILE.name]: { id: HOMETAB_PROFILE.name } })
);

export const DEFAULT_LAYOUT = {
  dockbox: {
    mode: "horizontal",
    children: [
      {
        tabs: [
          {
            id: HOMETAB_PROFILE.name
          }
        ]
      }
    ]
  },
  windowbox: { children: [] },
  maxbox: { children: [] },
  floatbox: { children: [] }
};
