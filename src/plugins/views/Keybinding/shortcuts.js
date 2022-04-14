export const KEYBINDINGS = {
  GENERAL: {
    NAME: "appShortcuts",
    LABEL: "AppKeybindLabel",
    DESCRIPTION: "AppKeybindDescription",
    KEYBINDS: {
      OPEN_WELCOME_TAB: {
        NAME: "openWelcomeTab",
        LABEL: "HomeTabTitle",
        DESCRIPTION: "HomeTabKeybindDescription",
        SHORTCUTS: "ctrl+shift+home"
      },
      OPEN_SHORTCUTS_TAB: {
        NAME: "openShortcutsTab",
        LABEL: "ShortcutsTabTitle",
        DESCRIPTION: "ShortcutsTabKeybindDescription",
        SHORTCUTS: "ctrl+shift+k"
      }
    }
  },
  EDITOR_GENERAL: {
    NAME: "editorGeneral",
    LABEL: "EditorGeneralKeybindLabel",
    DESCRIPTION: "EditorGeneralKeybindDescription",
    KEYBINDS: {
      SAVE: {
        NAME: "save",
        LABEL: "SaveDoc",
        DESCRIPTION: "SaveDocKeybindDescription",
        SHORTCUTS: "ctrl+s"
      },
      SAVE_ALL: {
        NAME: "saveAll",
        LABEL: "SaveAllDocs",
        DESCRIPTION: "SaveAllDocsKeybindDescription",
        SHORTCUTS: "ctrl+shift+s"
      },
      UNDO: {
        NAME: "undo",
        LABEL: "Undo",
        DESCRIPTION: "UndoKeybindDescription",
        SHORTCUTS: "ctrl+z"
      },
      REDO: {
        NAME: "redo",
        LABEL: "Redo",
        DESCRIPTION: "RedoKeybindDescription",
        SHORTCUTS: "ctrl+shift+z"
      },
      COPY: {
        NAME: "copy",
        LABEL: "Copy",
        DESCRIPTION: "CopyKeybindDescription",
        SHORTCUTS: "ctrl+c"
      },
      PASTE: {
        NAME: "paste",
        LABEL: "Paste",
        DESCRIPTION: "PasteKeybindDescription",
        SHORTCUTS: "ctrl+v"
      },
      CANCEL: {
        NAME: "cancel",
        LABEL: "Cancel",
        DESCRIPTION: "CancelKeybindDescription",
        SHORTCUTS: "esc"
      },
      DELETE: {
        NAME: "delete",
        LABEL: "Delete",
        DESCRIPTION: "DeleteKeybindDescription",
        SHORTCUTS: ["del", "backspace"]
      }
    }
  },
  FLOW: {
    NAME: "editorFlow",
    LABEL: "EditorFlowKeybindLabel",
    DESCRIPTION: "EditorGeneralKeybindDescription",
    SHORTCUTS: {
      COPY_NODE: {
        NAME: "copyNode",
        LABEL: "CopyNode",
        DESCRIPTION: "CopyNodeKeybindDescription",
        SHORTCUTS: "ctrl+c"
      },
      PASTE_NODE: {
        NAME: "pasteNode",
        LABEL: "PasteNode",
        DESCRIPTION: "PasteNodeKeybindDescription",
        SHORTCUTS: "ctrl+v"
      }
    }
  }
};
