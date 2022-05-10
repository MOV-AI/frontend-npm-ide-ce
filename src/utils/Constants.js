import i18n from "../i18n/i18n";

export const APP_DEFAULT_CONFIG = "app-ide-ce";
export const APP_CUSTOM_CONFIG = "app-custom-ide-ce";

const APPLICATION_DATA = window.SERVER_DATA?.Application;

export const MANAGER = "manager";

export const BRANDING = {
  NAME: "MOV.AI Flow™"
};

export const APP_INFORMATION = {
  VERSION: APPLICATION_DATA?.Version || "0.0.1",
  LAST_UPDATE: APPLICATION_DATA?.LastUpdate || "-",
  CONFIGURATION_FILE: APPLICATION_DATA?.Configuration || "-",
  CUSTOM_CONFIGURATION_FILE: APPLICATION_DATA?.CustomConfiguration || "-",
  DESCRIPTION: APPLICATION_DATA?.Description || "-",
  LABEL: APPLICATION_DATA?.Label || BRANDING.NAME
};

export const APP_LINKS = {
  DOCUMENTATION: "https://flow.mov.ai/",
  FORUM: "https://forum.flow.mov.ai/"
};

export const GLOBAL_WORKSPACE = "global";

export const DEFAULT_VALUE = undefined;
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
  CALLBACK: "Callback",
  CONFIGURATION: "Configuration",
  NODE: "Node",
  FLOW: "Flow"
};

export const HOSTS = {
  ABSTRACT_HOST: {
    NAME: "abstractHost"
  },
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
  APP_KEYBINDINGS: {
    NAME: "appKeybindings"
  },
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
      FOCUS_ACTIVE_TAB: "focusActiveTab",
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

export const KEYBIND_SCOPES = {
  APP: "all"
};

export const TABLE_KEYS_NAMES = {
  PARAMETERS: "parameters",
  ENVVARS: "envVars",
  CMDLINE: "commands"
};

export const EMPTY_MESSAGE = {
  PARAMETERS: "No Parameters",
  ENVVARS: "No Environment Variables",
  COMMANDS: "No Command Lines"
};

export const DIALOG_TITLE = {
  PARAMETERS: "Parameter",
  ENVVARS: "EnvironmentVariable",
  COMMANDS: "Command Line"
};

export const SAVE_OUTDATED_DOC_ACTIONS = {
  UPDATE_DOC: "updateDoc",
  OVERWRITE_DOC: "overwriteDoc",
  CANCEL: "cancel"
};

export const DEFAULT_KEY_VALUE_DATA = {
  name: "",
  description: "",
  type: DATA_TYPES.ANY,
  value: ""
};

/**
 * Used for Port Names
 * We’re using a valid ROS validation which only allows for a name to begin with a letter, tilde (~) or a forward slash (/),
 * and then followed by any letters, numbers, underscores and forward slash (/),
 * but can’t have 2 underscores in a row;
 */
export const ROS_VALID_NAMES = new RegExp(
  /(?!.*__.*)^[a-zA-Z~/]{1}?[a-zA-Z0-9_/]*$/
);

/**
 * Used for Parameters, Environment Variables and Command Line
 * We’re using a variation of the valid ROS validation which only allows for a name to begin with a letter,
 * tilde (~) or a forward slash (/), but also allowing the first character to be an underscore (_),
 * and then followed by any letters, numbers, underscores and forward slash (/),
 * but can’t have 2 underscores in a row;
 */
export const ROS_VALID_NAMES_VARIATION = new RegExp(
  /(?!.*__.*)^[a-zA-Z_~/]{1}?[a-zA-Z0-9_/]*$/
);

export const ALERT_SEVERITIES = {
  SUCCESS: "success",
  ERROR: "error",
  INFO: "info",
  WARNING: "warning"
};

//========================================================================================
/*                                                                                      *
 *                                   Layout Constants                                   *
 *                                                                                      */
//========================================================================================

export const DEFAULT_EXPLORER_ROW_HEIGHT = 40;

export const DOCK_POSITIONS = {
  DOCK: "dockbox",
  WINDOW: "windowbox",
  MAX: "maxbox",
  FLOAT: "floatbox"
};

export const DOCK_MODES = {
  MAXIMIZE: "maximize",
  REMOVE: "remove"
};

export const FLOW_EXPLORER_PROFILE = {
  name: "FlowExplorer",
  title: "AddNodeOrSubFlow"
};

export const HOMETAB_PROFILE = {
  name: "HomeTab",
  title: i18n.t("HomeTabTitle")
};

export const SHORTCUTS_PROFILE = {
  name: "ShortcutsTab",
  title: i18n.t("ShortcutsTabTitle")
};

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
