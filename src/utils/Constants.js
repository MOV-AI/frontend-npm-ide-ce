export const APP_DEFAULT_CONFIG = "app-ide-ce";
export const APP_CUSTOM_CONFIG = "app-custom-ide-ce";

export const MANAGER = "manager";

export const APP_INFORMATION = {
  VERSION: window.SERVER_DATA?.Application?.Version || "0.0.1",
  COMMIT: window.SERVER_DATA?.Application?.Commit || "-",
  DATE: window.SERVER_DATA?.Application?.Date || "-"
};

export const BRANDING = {
  NAME: "Mov.ai Flow™"
};

export const DISABLED_VALUE = "None";

export const DATA_TYPES = {
  BOOLEAN: "boolean",
  STRING: "string",
  NUMBER: "number",
  OBJECT: "object",
  ARRAY: "array",
  ANY: "any"
};

export const SCOPES = {
  Callback: "Callback",
  Configuration: "Configuration",
  Flow: "Flow",
  Node: "Node"
};

export const HOSTS = {
  TOP_BAR: {
    NAME: "topBar"
  },
  LEFT_PANEL: {
    NAME: "leftPanel"
  },
  MAIN_PANEL: {
    NAME: "mainPanel"
  },
  LEFT_DRAWER: {
    NAME: "leftDrawer",
    CALL: {
      OPEN: "open",
      CLOSE: "close",
      TOGGLE: "toggle"
    }
  },
  BOTTOM_BAR: {
    NAME: "bottomBar"
  }
};

export const PLUGINS = {
  DOC_MANAGER: {
    NAME: "docManager",
    CALL: {
      READ: "read",
      SAVE: "save",
      BROADCAST: "broadcast",
      GET_STORE: "getStore",
      GET_DOC_FACTORY: "getDocFactory",
      GET_DOC_TYPES: "getDocTypes",
      SUBSCRIBE_TO_CHANGES: "subscribeToChanges",
      UNSUBSCRIBE_TO_CHANGES: "unSubscribeToChanges",
      GET_DOC_FROM_NAME_TYPE: "getDocFromNameType",
      CHECK_DOCUMENT_EXISTS: "checkDocumentExists",
      DISCARD_DOC_CHANGES: "discardDocChanges",
      RELOAD_DOC: "reloadDoc",
      COPY: "copy",
      DELETE: "delete",
      CREATE: "create",
      SAVE_ACTIVE_EDITOR: "saveActiveEditor",
      SAVE_DIRTIES: "saveDirties"
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
  TABS: {
    NAME: "tabs",
    CALL: {
      OPEN: "open",
      CLOSE: "close",
      OPEN_EDITOR: "openEditor",
      UPDATE_TAB_ID: "updateTabId",
      GET_ACTIVE_TAB: "getActiveTab"
    },
    ON: {
      OPEN_EDITOR: "openEditor",
      ACTIVE_TAB_CHANGE: "activeTabChange"
    }
  },
  RIGHT_DRAWER: {
    NAME: "rightDrawer",
    CALL: {
      ADD_BOOKMARK: "addBookmark",
      SET_BOOKMARK: "setBookmark",
      REMOVE_BOOKMARK: "removeBookmark",
      RESET_BOOKMARKS: "resetBookmarks"
    },
    ON: {
      CHANGE_BOOKMARK: "changeBookmark"
    }
  },
  DIALOG: {
    NAME: "dialog",
    CALL: {
      NEW_DOC: "newDocument",
      SAVE_OUTDATED_DOC: "saveOutdatedDocument",
      CONFIRMATION: "confirmation",
      COPY_DOC: "copyDocument",
      FORM_DIALOG: "formDialog",
      SELECT_SCOPE_MODAL: "selectScopeModal",
      CLOSE_DIRTY_DOC: "closeDirtyDocument",
      CUSTOM: "custom",
      CUSTOM_DIALOG: "customDialog",
      ALERT: "alert"
    }
  },
  ALERT: {
    NAME: "alert",
    CALL: {
      SHOW: "show"
    }
  },
  MAIN_MENU: {
    NAME: "mainMenu"
  },
  EXPLORER: {
    NAME: "explorer"
  },
  PLACEHOLDER: {
    NAME: "placeholder"
  },
  FLOW_EXPLORER: {
    NAME: "FlowExplorer",
    CALL: {},
    ON: { ADD_NODE: "addNode" }
  },
  SYSTEM_BAR: {
    NAME: "systemBar"
  }
};

export const DEFAULT_KEY_VALUE_DATA = {
  name: "",
  description: "",
  type: DATA_TYPES.ANY,
  value: ""
};

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
  FLOAT: "floatbox"
};

export const FLOW_EXPLORER_PROFILE = {
  name: "FlowExplorer",
  title: "Add Node / Sub-flow"
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
