import i18n from "../../../i18n/i18n";

export const KEYBINDINGS = {
  GENERAL: {
    NAME: "appShortcuts",
    LABEL: i18n.t("AppKeybindLabel"),
    DESCRIPTION: i18n.t("AppKeybindDescription"),
    KEYBINDS: {
      OPEN_WELCOME_TAB: {
        NAME: "openWelcomeTab",
        LABEL: i18n.t("HomeTabTitle"),
        DESCRIPTION: i18n.t("HomeTabKeybindDescription"),
        SHORTCUTS: "ctrl+alt+home"
      },
      OPEN_SHORTCUTS_TAB: {
        NAME: "openShortcutsTab",
        LABEL: i18n.t("ShortcutsTabTitle"),
        DESCRIPTION: i18n.t("ShortcutsTabKeybindDescription"),
        SHORTCUTS: "ctrl+alt+k"
      },
      SAVE_ALL: {
        NAME: "saveAll",
        LABEL: i18n.t("SaveAllDocs"),
        DESCRIPTION: i18n.t("SaveAllDocsKeybindDescription"),
        SHORTCUTS: "ctrl+alt+s"
      }
    }
  },
  EDITOR_GENERAL: {
    NAME: "editorGeneral",
    LABEL: i18n.t("EditorGeneralKeybindLabel"),
    DESCRIPTION: i18n.t("EditorGeneralKeybindDescription"),
    KEYBINDS: {
      SAVE: {
        NAME: "save",
        LABEL: i18n.t("SaveDoc"),
        DESCRIPTION: i18n.t("SaveDocKeybindDescription"),
        SHORTCUTS: "ctrl+s"
      },
      // TODO Add later when we have a working UNDO / REDO engine
      // UNDO: {
      //   NAME: "undo",
      //   LABEL: i18n.t("Undo"),
      //   DESCRIPTION: i18n.t("UndoKeybindDescription"),
      //   SHORTCUTS: "ctrl+z"
      // },
      // REDO: {
      //   NAME: "redo",
      //   LABEL: i18n.t("Redo"),
      //   DESCRIPTION: i18n.t("RedoKeybindDescription"),
      //   SHORTCUTS: ["ctrl+shift+z", "ctrl+y"]
      // },
      // COPY: {
      //   NAME: "copy",
      //   LABEL: i18n.t("Copy"),
      //   DESCRIPTION: i18n.t("CopyKeybindDescription"),
      //   SHORTCUTS: "ctrl+c"
      // },
      // PASTE: {
      //   NAME: "paste",
      //   LABEL: i18n.t("Paste"),
      //   DESCRIPTION: i18n.t("PasteKeybindDescription"),
      //   SHORTCUTS: "ctrl+v"
      // },
      CANCEL: {
        NAME: "cancel",
        LABEL: i18n.t("Cancel"),
        DESCRIPTION: i18n.t("CancelKeybindDescription"),
        SHORTCUTS: "esc"
      },
      DELETE: {
        NAME: "delete",
        LABEL: i18n.t("Delete"),
        DESCRIPTION: i18n.t("DeleteKeybindDescription"),
        SHORTCUTS: ["del", "backspace"]
      }
    }
  },
  MONACO_SPECIFIC: {
    NAME: "monacoCodeEditor",
    LABEL: i18n.t("EditorMonacoKeybindLabel"),
    DESCRIPTION: i18n.t("EditorMonacoKeybindDescription"),
    KEYBINDS: {
      CHANGE_ALL_OCURRENCES: {
        NAME: "changeAllOcurrences",
        LABEL: i18n.t("ChangeAllOcurrencesKeybindLabel"),
        DESCRIPTION: i18n.t("ChangeAllOcurrencesKeybindDescription"),
        SHORTCUTS: "ctrl+F2"
      },
      COMMAND_PALETTE: {
        NAME: "commandPalette",
        LABEL: i18n.t("CommandPaletteKeybindLabel"),
        DESCRIPTION: i18n.t("CommandPaletteKeybindDescription"),
        SHORTCUTS: "F1"
      },
      UNDO: {
        NAME: "undo",
        LABEL: i18n.t("Undo"),
        DESCRIPTION: i18n.t("UndoKeybindDescription"),
        SHORTCUTS: "ctrl+z"
      },
      REDO: {
        NAME: "redo",
        LABEL: i18n.t("Redo"),
        DESCRIPTION: i18n.t("RedoKeybindDescription"),
        SHORTCUTS: ["ctrl+shift+z", "ctrl+y"]
      },
      CUT: {
        NAME: "monacoEditorCutCode",
        LABEL: i18n.t("CutCode"),
        DESCRIPTION: i18n.t("CutCodeKeybindDescription"),
        SHORTCUTS: "ctrl+x"
      },
      COPY: {
        NAME: "monacoEditorCopyCode",
        LABEL: i18n.t("CopyCode"),
        DESCRIPTION: i18n.t("CopyCodeKeybindDescription"),
        SHORTCUTS: "ctrl+c"
      },
      PASTE: {
        NAME: "monacoEditorPasteCode",
        LABEL: i18n.t("PasteCode"),
        DESCRIPTION: i18n.t("PasteCodeKeybindDescription"),
        SHORTCUTS: "ctrl+v"
      }
    }
  },
  FLOW: {
    NAME: "editorFlow",
    LABEL: i18n.t("EditorFlowKeybindLabel"),
    DESCRIPTION: i18n.t("EditorFlowKeybindDescription"),
    KEYBINDS: {
      COPY_NODE: {
        NAME: "copyNode",
        LABEL: i18n.t("CopyNode"),
        DESCRIPTION: i18n.t("CopyNodeKeybindDescription"),
        SHORTCUTS: "ctrl+c"
      },
      PASTE_NODE: {
        NAME: "pasteNode",
        LABEL: i18n.t("PasteNode"),
        DESCRIPTION: i18n.t("PasteNodeKeybindDescription"),
        SHORTCUTS: "ctrl+v"
      }
    }
  }
};
