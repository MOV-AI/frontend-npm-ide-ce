import i18n from "../../../i18n/i18n";
import { getIconByScope, parseKeybinds } from "../../../utils/Utils";
import {
  APP_INFORMATION,
  APP_LINKS,
  BRANDING,
  PLUGINS
} from "../../../utils/Constants";
import { KEYBINDINGS } from "../Keybinding/shortcuts";
import { getHomeTab } from "../HomeTab/HomeTab";
import movaiIconWhite from "../editors/_shared/Branding/movai-logo-white.png";
import { getShortcutsTab } from "../Keybinding/Shortcuts";

const buildMenus = async (call, classes) => {
  const buildNewFileSubmenu = async () => {
    const menu = [];
    await call(
      PLUGINS.DOC_MANAGER.NAME,
      PLUGINS.DOC_MANAGER.CALL.GET_DOC_TYPES
    ).then(docTypes => {
      docTypes.forEach(docType => {
        menu.push({
          id: docType.name,
          title: docType.scope,
          icon: getIconByScope(docType.scope),
          callback: () => {
            call(PLUGINS.DOC_MANAGER.NAME, PLUGINS.DOC_MANAGER.CALL.CREATE, {
              scope: docType.scope
            }).then(document => {
              call(PLUGINS.TABS.NAME, PLUGINS.TABS.CALL.OPEN_EDITOR, {
                id: document.getUrl(),
                name: document.getName(),
                scope: docType.scope,
                isNew: true
              });
            });
          }
        });
      });
    });
    return menu;
  };

  const renderPopupInfo = () => {
    return (
      <div className={classes.contentHolder}>
        <p>
          {i18n.t("Version-Colon")} {APP_INFORMATION.VERSION}
        </p>
        <p>
          {i18n.t("LastUpdate-Colon")} {APP_INFORMATION.LAST_UPDATE}
        </p>
        <p>
          {i18n.t("ConfigurationFile-Colon")}{" "}
          {APP_INFORMATION.CONFIGURATION_FILE}
        </p>
        <p>
          {i18n.t("CustomConfigurationFile-Colon")}
          {APP_INFORMATION.CUSTOM_CONFIGURATION_FILE}
        </p>
        <p>
          {i18n.t("AppDescription")}: {APP_INFORMATION.DESCRIPTION}
        </p>
      </div>
    );
  };

  const saveDocument = () => {
    call(PLUGINS.DOC_MANAGER.NAME, PLUGINS.DOC_MANAGER.CALL.SAVE_ACTIVE_EDITOR);
  };

  const saveAllDocument = () => {
    call(PLUGINS.DOC_MANAGER.NAME, PLUGINS.DOC_MANAGER.CALL.SAVE_DIRTIES);
  };

  const aboutPopup = () => {
    call(PLUGINS.DIALOG.NAME, PLUGINS.DIALOG.CALL.ALERT, {
      title: (
        <>
          <img
            className={classes.movaiIcon}
            src={movaiIconWhite}
            alt="MOV.AI Logo"
          />
          <span>{BRANDING.NAME}</span>
        </>
      ),
      message: renderPopupInfo(),
      submitText: i18n.t("Ok")
    });
  };

  function openLink(link) {
    window.open(link, "_blank");
  }

  /**
   * Open Welcome tab
   */
  const openWelcomeTab = () => {
    const homeTab = getHomeTab();
    call(PLUGINS.TABS.NAME, PLUGINS.TABS.CALL.OPEN, homeTab);
  };

  /**
   * Open Shortcuts tab
   */
  const openShortcutsTab = () => {
    const shortcutsTab = getShortcutsTab();
    call(PLUGINS.TABS.NAME, PLUGINS.TABS.CALL.OPEN, shortcutsTab);
  };

  return [
    {
      id: "fileMenu",
      title: "File",
      data: [
        {
          id: "newFile",
          title: i18n.t("NewDoc"),
          data: await buildNewFileSubmenu()
        },
        {},
        {
          id: "saveFile",
          title: i18n.t(KEYBINDINGS.EDITOR_GENERAL.KEYBINDS.SAVE.LABEL),
          keybind: parseKeybinds(
            KEYBINDINGS.EDITOR_GENERAL.KEYBINDS.SAVE.SHORTCUTS
          ),
          callback: saveDocument
        },
        {
          id: "saveAllFiles",
          title: i18n.t(KEYBINDINGS.EDITOR_GENERAL.KEYBINDS.SAVE_ALL.LABEL),
          keybind: parseKeybinds(
            KEYBINDINGS.EDITOR_GENERAL.KEYBINDS.SAVE_ALL.SHORTCUTS
          ),
          callback: saveAllDocument
        }
      ]
    },
    // Maybe add this in the future?
    // {
    //   id: "editMenu",
    //   title: "Edit",
    //   data: [
    //     {
    //       id: "copy",
    //       title: i18n.t(KEYBINDINGS.EDITOR_GENERAL.KEYBINDS.COPY.LABEL),
    //       keybind: parseKeybinds(KEYBINDINGS.EDITOR_GENERAL.KEYBINDS.COPY.SHORTCUTS),
    //       callback: copyCode
    //     },
    //     {
    //       id: "paste",
    //       title: i18n.t(KEYBINDINGS.EDITOR_GENERAL.KEYBINDS.PASTE.LABEL),
    //       keybind: parseKeybinds(KEYBINDINGS.EDITOR_GENERAL.KEYBINDS.PASTE.SHORTCUTS),
    //       callback: pasteCode
    //     }
    //   ]
    // },
    {
      id: "helpMenu",
      title: "Help",
      data: [
        {
          id: "getStarted",
          title: i18n.t(KEYBINDINGS.GENERAL.KEYBINDS.OPEN_WELCOME_TAB.LABEL),
          keybind: parseKeybinds(
            KEYBINDINGS.GENERAL.KEYBINDS.OPEN_WELCOME_TAB.SHORTCUTS
          ),
          callback: openWelcomeTab
        },
        {
          id: "keyboardShortcuts",
          title: i18n.t(KEYBINDINGS.GENERAL.KEYBINDS.OPEN_SHORTCUTS_TAB.LABEL),
          keybind: parseKeybinds(
            KEYBINDINGS.GENERAL.KEYBINDS.OPEN_SHORTCUTS_TAB.SHORTCUTS
          ),
          callback: openShortcutsTab
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
          callback: aboutPopup
        }
      ]
    }
  ];
};

export default buildMenus;
