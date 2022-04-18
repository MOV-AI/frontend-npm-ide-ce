import i18n from "../../../../i18n/i18n";
import {
  APP_INFORMATION,
  BRANDING,
  PLUGINS
} from "../../../../utils/Constants";
import { getHomeTab } from "../../HomeTab/HomeTab";
import movaiIconWhite from "../../editors/_shared/Branding/movai-logo-white.png";
import { getShortcutsTab } from "../../Keybinding/Shortcuts";

//========================================================================================
/*                                                                                      *
 *                                    Private Methods                                   *
 *                                                                                      */
//========================================================================================

function renderPopupInfo(classes) {
  return (
    <div className={classes.contentHolder}>
      <p>
        {i18n.t("Version-Colon")} {APP_INFORMATION.VERSION}
      </p>
      <p>
        {i18n.t("LastUpdate-Colon")} {APP_INFORMATION.LAST_UPDATE}
      </p>
      <p>
        {i18n.t("ConfigurationFile-Colon")} {APP_INFORMATION.CONFIGURATION_FILE}
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
}

//========================================================================================
/*                                                                                      *
 *                                    Exposed Methods                                   *
 *                                                                                      */
//========================================================================================

export function saveDocument(call) {
  call(PLUGINS.DOC_MANAGER.NAME, PLUGINS.DOC_MANAGER.CALL.SAVE_ACTIVE_EDITOR);
}

export function saveAllDocument(call) {
  call(PLUGINS.DOC_MANAGER.NAME, PLUGINS.DOC_MANAGER.CALL.SAVE_DIRTIES);
}

export function aboutPopup(call, classes) {
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
    message: renderPopupInfo(classes),
    submitText: i18n.t("Ok")
  });
}

export function openLink(link) {
  window.open(link, "_blank");
}

/**
 * Open Welcome tab
 */
export function openWelcomeTab(call) {
  const homeTab = getHomeTab();
  call(PLUGINS.TABS.NAME, PLUGINS.TABS.CALL.OPEN, homeTab);
}

/**
 * Open Shortcuts tab
 */
export function openShortcutsTab(call) {
  const shortcutsTab = getShortcutsTab();
  call(PLUGINS.TABS.NAME, PLUGINS.TABS.CALL.OPEN, shortcutsTab);
}
