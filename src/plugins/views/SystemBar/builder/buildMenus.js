import i18n from "../../../../i18n/i18n";
import { getSystemBarTools, hasTool } from "../../../../tools";
import AppSettings from "../../../../App/AppSettings";
import { parseKeybinds } from "../../../../utils/Utils";
import {
  HOMETAB_PROFILE,
  SHORTCUTS_PROFILE
} from "../../../../utils/Constants";
import { KEYBINDINGS } from "../../../../utils/shortcuts";
import { buildNewFileSubmenu } from "./buildSubMenus";
import {
  saveDocument,
  saveAllDocument,
  aboutPopup,
  openLink,
  openTool
} from "./buildFunctions";

const buildMenus = async (call, classes) => {
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
    const hasHomeTab = hasTool(HOMETAB_PROFILE.name);
    const hasShortcutsTab = hasTool(SHORTCUTS_PROFILE.name);
    const hasDocumentation = Boolean(AppSettings.HELP.DOCUMENTATION);
    const hasForum = Boolean(AppSettings.HELP.FORUM);
    return {
      id: "helpMenu",
      title: "Help",
      data: [
        hasHomeTab
          ? {
              id: "getStarted",
              title: i18n.t(
                KEYBINDINGS.GENERAL.KEYBINDS.OPEN_WELCOME_TAB.LABEL
              ),
              keybind: parseKeybinds(
                KEYBINDINGS.GENERAL.KEYBINDS.OPEN_WELCOME_TAB.SHORTCUTS
              ),
              callback: () => openTool(call, HOMETAB_PROFILE.name)
            }
          : null,
        hasShortcutsTab
          ? {
              id: "keyboardShortcuts",
              title: i18n.t(
                KEYBINDINGS.GENERAL.KEYBINDS.OPEN_SHORTCUTS_TAB.LABEL
              ),
              keybind: parseKeybinds(
                KEYBINDINGS.GENERAL.KEYBINDS.OPEN_SHORTCUTS_TAB.SHORTCUTS
              ),
              callback: () => openTool(call, SHORTCUTS_PROFILE.name)
            }
          : null,
        hasHomeTab || hasShortcutsTab ? {} : null,

        hasDocumentation
          ? {
              id: "documentation",
              title: i18n.t("Documentation"),
              externalLink: true,
              callback: () => openLink(AppSettings.HELP.DOCUMENTATION)
            }
          : null,
        hasForum
          ? {
              id: "forum",
              title: i18n.t("Forum"),
              externalLink: true,
              callback: () => openLink(AppSettings.HELP.FORUM)
            }
          : null,
        hasDocumentation || hasForum ? {} : null,
        {
          id: "about",
          title: i18n.t("About"),
          callback: () => aboutPopup(call, classes)
        }
      ].filter(el => el)
    };
  }

  function buildToolsMenu() {
    return {
      id: "toolsMenu",
      title: i18n.t("Tools"),
      data: getSystemBarTools().map(tool => ({
        id: tool.id,
        title: tool.profile.title,
        callback: () => openTool(call, tool.profile.name)
      }))
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
    // Add tools menu
    const tools = buildToolsMenu();
    if (tools.data.length) menu.push(tools);

    return menu;
  }

  return buildMenu();
};

export default buildMenus;
