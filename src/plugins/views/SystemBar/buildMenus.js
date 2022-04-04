import i18n from "../../../i18n/i18n";
import { getIconByScope } from "../../../utils/Utils";
import {
  APP_INFORMATION,
  APP_LINKS,
  BRANDING,
  PLUGINS
} from "../../../utils/Constants";
import { KEYBINDINGS } from "../../../utils/Keybindings";
import movaiIconWhite from "../editors/_shared/Branding/movai-logo-white.png";

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
          {i18n.t("Version")}: {APP_INFORMATION.VERSION}
        </p>
        <p>
          {i18n.t("Last update")}: {APP_INFORMATION.LAST_UPDATE}
        </p>
        <p>
          {i18n.t("Configuration File")}: {APP_INFORMATION.CONFIGURATION_FILE}
        </p>
        <p>
          {i18n.t("Custom Configuration File")}:
          {APP_INFORMATION.CUSTOM_CONFIGURATION_FILE}
        </p>
        <p>
          {i18n.t("App Description")}: {APP_INFORMATION.DESCRIPTION}
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
      submitText: i18n.t("OK")
    });
  };

  function openLink(link) {
    window.open(link, "_blank");
  }

  return [
    {
      id: "fileMenu",
      title: "File",
      data: [
        {
          id: "newFile",
          title: "New File",
          data: await buildNewFileSubmenu()
        },
        {},
        {
          id: "saveFile",
          title: "Save File",
          keybind: KEYBINDINGS.SAVE,
          callback: saveDocument
        },
        {
          id: "saveAllFiles",
          title: "Save All",
          keybind: KEYBINDINGS.SAVE_ALL,
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
    //       title: "Copy",
    //       keybind: KEYBINDINGS.COPY,
    //       callback: copyCode
    //     },
    //     {
    //       id: "paste",
    //       title: "Paste",
    //       keybind: KEYBINDINGS.PASTE,
    //       callback: pasteCode
    //     }
    //   ]
    // },
    {
      id: "helpMenu",
      title: "Help",
      data: [
        {
          id: "documentation",
          title: "Documentation",
          externalLink: true,
          callback: () => openLink(APP_LINKS.DOCUMENTATION)
        },
        {
          id: "forum",
          title: "Forum",
          externalLink: true,
          callback: () => openLink(APP_LINKS.FORUM)
        },
        {},
        {
          id: "about",
          title: "About",
          callback: aboutPopup
        }
      ]
    }
  ];
};

export default buildMenus;
