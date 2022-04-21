import i18n from "../../../../i18n/i18n";
import { parseKeybinds } from "../../../../utils/Utils";
import { APP_LINKS } from "../../../../utils/Constants";
import { KEYBINDINGS } from "../../Keybinding/shortcuts";
import { buildNewFileSubmenu } from "./buildSubMenus";
import {
  saveDocument,
  saveAllDocument,
  aboutPopup,
  openLink,
  openWelcomeTab,
  openShortcutsTab
} from "./buildFunctions";

const buildMenus = async (call, classes, _activeEditorScope) => {
  const buildFileMenu = async () => {
    return {
      id: "fileMenu",
      title: "File",
      data: [
        {
          id: "newFile",
          title: i18n.t("NewDoc"),
          data: await buildNewFileSubmenu(call)
        },
        // Get the last 10 and show them here
        // {
        //   id: "openRecentFiles",
        //   title: i18n.t("OpenRecent")
        //   data: async () => await buildRecentFilesSubmenu(call, classes)
        // },
        // {},
        {},
        {
          id: "saveFile",
          title: i18n.t(KEYBINDINGS.EDITOR_GENERAL.KEYBINDS.SAVE.LABEL),
          keybind: parseKeybinds(
            KEYBINDINGS.EDITOR_GENERAL.KEYBINDS.SAVE.SHORTCUTS
          ),
          callback: () => saveDocument(call)
        },
        {
          id: "saveAllFiles",
          title: i18n.t(KEYBINDINGS.GENERAL.KEYBINDS.SAVE_ALL.LABEL),
          keybind: parseKeybinds(
            KEYBINDINGS.GENERAL.KEYBINDS.SAVE_ALL.SHORTCUTS
          ),
          callback: () => saveAllDocument(call)
        }
      ]
    };
  };

  // TODO add this later
  // function buildEditMenu() {
  //   return {
  //     id: "editMenu",
  //     title: "Edit",
  //     data: [
  //       {
  //         id: "copy",
  //         title: i18n.t(KEYBINDINGS.EDITOR_GENERAL.KEYBINDS.COPY.LABEL),
  //         keybind: parseKeybinds(
  //           KEYBINDINGS.EDITOR_GENERAL.KEYBINDS.COPY.SHORTCUTS
  //         )
  //         // callback: () => copyCode(call)
  //       },
  //       {
  //         id: "paste",
  //         title: i18n.t(KEYBINDINGS.EDITOR_GENERAL.KEYBINDS.PASTE.LABEL),
  //         keybind: parseKeybinds(
  //           KEYBINDINGS.EDITOR_GENERAL.KEYBINDS.PASTE.SHORTCUTS
  //         )
  //         // callback: () => pasteCode(call)
  //       }
  //     ]
  //   };
  // }

  // TODO complete this menu by editor (Flow is halfway)
  // const buildInnerMenus = () => {
  //   const innerMenus = [];
  //   switch (activeEditorScope) {
  //     case SCOPES.CALLBACK:
  //       break;
  //     case SCOPES.CONFIGURATION:
  //       break;
  //     case SCOPES.FLOW:
  //       innerMenus.push({
  //         id: "flowMenu",
  //         title: "Flow",
  //         data: [
  //           // We should not limit the recent file stack to 10, but rather filter by 10 to show on Hometab
  //           // Then we can get the last 10 by scope (in this case Flow) and show them here
  //           // {
  //           //   id: "openRecentFlows",
  //           //   title: i18n.t("OpenRecent")
  //           //   data: async () => await buildRecentFlowsSubmenu(call, classes)
  //           // },
  //           // {},
  //           {
  //             id: "copyNode",
  //             title: i18n.t(KEYBINDINGS.FLOW.KEYBINDS.COPY_NODE.LABEL),
  //             keybind: parseKeybinds(
  //               KEYBINDINGS.FLOW.KEYBINDS.COPY_NODE.SHORTCUTS
  //             )
  //             // callback: () => copyNode(call)
  //           },
  //           {
  //             id: "pasteNode",
  //             title: i18n.t(KEYBINDINGS.FLOW.KEYBINDS.PASTE_NODE.LABEL),
  //             keybind: parseKeybinds(
  //               KEYBINDINGS.FLOW.KEYBINDS.PASTE_NODE.SHORTCUTS
  //             )
  //             // callback: () => pasteNode(call)
  //           }
  //         ]
  //       });
  //       break;
  //     case SCOPES.NODE:
  //       break;
  //     default:
  //       break;
  //   }
  //   return innerMenus;
  // };

  function buildHelpMenu() {
    return {
      id: "helpMenu",
      title: "Help",
      data: [
        {
          id: "getStarted",
          title: i18n.t(KEYBINDINGS.GENERAL.KEYBINDS.OPEN_WELCOME_TAB.LABEL),
          keybind: parseKeybinds(
            KEYBINDINGS.GENERAL.KEYBINDS.OPEN_WELCOME_TAB.SHORTCUTS
          ),
          callback: () => openWelcomeTab(call)
        },
        {
          id: "keyboardShortcuts",
          title: i18n.t(KEYBINDINGS.GENERAL.KEYBINDS.OPEN_SHORTCUTS_TAB.LABEL),
          keybind: parseKeybinds(
            KEYBINDINGS.GENERAL.KEYBINDS.OPEN_SHORTCUTS_TAB.SHORTCUTS
          ),
          callback: () => openShortcutsTab(call)
        },
        {},
        {
          id: "documentation",
          title: i18n.t("Documentation"),
          externalLink: true,
          callback: () => openLink(APP_LINKS.DOCUMENTATION)
        },
        {
          id: "forum",
          title: i18n.t("Forum"),
          externalLink: true,
          callback: () => openLink(APP_LINKS.FORUM)
        },
        {},
        {
          id: "about",
          title: i18n.t("About"),
          callback: () => aboutPopup(call, classes)
        }
      ]
    };
  }

  async function buildMenu() {
    const menu = [];
    // TODO complete this menu by editor (Flow is halfway)
    // const innerMenus = buildInnerMenus();

    menu.push(await buildFileMenu());
    // TODO add this later
    // menu.push(buildEditMenu());
    // innerMenus.length && menu.push(...innerMenus);
    menu.push(buildHelpMenu());

    return menu;
  }

  return buildMenu();
};

export default buildMenus;
