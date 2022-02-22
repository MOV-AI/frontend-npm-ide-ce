import i18n from "../../../i18n/i18n";
import { simulateMouseClick } from "../../../utils/Utils";
import { BRANDING, PLUGINS, APP_INFORMATION } from "../../../utils/Constants";
import { KEYBINDINGS } from "../../../utils/Keybindings";
import movaiIconWhite from "../editors/_shared/Branding/movai-logo-white.png";

const buildMenus = (call, classes) => {
  const renderPopupInfo = () => {
    return (
      <div className={classes.contentHolder}>
        <p>
          {i18n.t("Version")}: {APP_INFORMATION.VERSION}
        </p>
        <p>
          {i18n.t("Commit")}: {APP_INFORMATION.COMMIT}
        </p>
        <p>
          {i18n.t("Date")}: {APP_INFORMATION.DATE}
        </p>
      </div>
    );
  };
  const newDocument = () => {
    const newDocTrigger = document.getElementById("mainMenuCreateNewDocument");
    simulateMouseClick(newDocTrigger);
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
          />{" "}
          <span>{BRANDING.NAME}</span>
        </>
      ),
      message: renderPopupInfo(),
      submitText: i18n.t("OK")
    });
  };

  return [
    {
      id: "fileMenu",
      title: "File",
      data: [
        {
          id: "newFile",
          title: "New File",
          callback: newDocument
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
          callback: () =>
            window.open("https://movai-flow.readme.io/docs", "_blank")
        },
        {
          id: "forum",
          title: "Forum",
          externalLink: true,
          callback: () =>
            window.open("https://discourse.aws.cloud.mov.ai/", "_blank")
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
