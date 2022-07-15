import i18n from "../../../../i18n/i18n";
import AppSettings from "../../../../App/AppSettings";
import { PLUGINS } from "../../../../utils/Constants";
import movaiIconWhite from "../../../../Branding/movai-logo-white.png";
import { getHomeTab } from "../../../../tools/HomeTab/HomeTab";
import { getShortcutsTab } from "../../../../tools/AppShortcuts/AppShortcuts";
import { getToolTabData } from "../../../../tools";

//========================================================================================
/*                                                                                      *
 *                                    Private Methods                                   *
 *                                                                                      */
//========================================================================================

function renderPopupInfo(classes) {
  return (
    <div className={classes.contentHolder}>
      <p>
        {i18n.t("Version-Colon")} {AppSettings.APP_INFORMATION.VERSION}
      </p>
      <p>
        {i18n.t("LastUpdate-Colon")} {AppSettings.APP_INFORMATION.LAST_UPDATE}
      </p>
      <p>
        {i18n.t("ConfigurationFile-Colon")}{" "}
        {AppSettings.APP_INFORMATION.CONFIGURATION_FILE}
      </p>
      <p>
        {i18n.t("CustomConfigurationFile-Colon")}
        {AppSettings.APP_INFORMATION.CUSTOM_CONFIGURATION_FILE}
      </p>
      <p>
        {i18n.t("AppDescription")}: {AppSettings.APP_INFORMATION.DESCRIPTION}
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
        <span>{AppSettings.NAME}</span>
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
 * Open Tool tab
 * @param {function} call : Plugin call method
 * @param {string} toolName : Tool Unique Name
 */
export function openTool(call, toolName) {
  const tabData = getToolTabData({ id: toolName });
  call(PLUGINS.TABS.NAME, PLUGINS.TABS.CALL.OPEN, tabData);
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
