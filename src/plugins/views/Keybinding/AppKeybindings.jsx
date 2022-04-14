import React, { useCallback, useEffect } from "react";
import PropTypes from "prop-types";
import hotkeys from "hotkeys-js";
import withKeyBinds from "../../../decorators/withKeyBinds";
import { withViewPlugin } from "../../../engine/ReactPlugin/ViewReactPlugin";
import { KEYBIND_SCOPES, PLUGINS } from "../../../utils/Constants";
import { getHomeTab } from "../HomeTab/HomeTab";
import { getShortcutsTab } from "./Shortcuts";
import { KEYBINDINGS } from "./shortcuts";

const AppKeybindings = props => {
  const { addKeyBind, removeKeyBind, call } = props;

  //========================================================================================
  /*                                                                                      *
   *                                    Private Methods                                   *
   *                                                                                      */
  //========================================================================================

  /**
   * Open Welcome tab
   */
  const openWelcomeTab = useCallback(() => {
    const homeTab = getHomeTab();
    call(PLUGINS.TABS.NAME, PLUGINS.TABS.CALL.OPEN, homeTab);
  }, [call]);

  /**
   * Open Shortcuts tab
   */
  const openShortcutsTab = useCallback(() => {
    const shortcutsTab = getShortcutsTab();
    call(PLUGINS.TABS.NAME, PLUGINS.TABS.CALL.OPEN, shortcutsTab);
  }, [call]);

  //========================================================================================
  /*                                                                                      *
   *                                    React Lifecycle                                   *
   *                                                                                      */
  //========================================================================================

  useEffect(() => {
    hotkeys(
      `${KEYBINDINGS.GENERAL.KEYBINDS.OPEN_WELCOME_TAB.SHORTCUTS},${KEYBINDINGS.GENERAL.KEYBINDS.OPEN_SHORTCUTS_TAB.SHORTCUTS}`,
      function (event, handler) {
        switch (handler.key) {
          case KEYBINDINGS.GENERAL.KEYBINDS.OPEN_WELCOME_TAB.SHORTCUTS:
            openWelcomeTab();
            break;
          case KEYBINDINGS.GENERAL.KEYBINDS.OPEN_SHORTCUTS_TAB.SHORTCUTS:
            openShortcutsTab();
            break;
          default:
            console.warn(event);
        }
      }
    );

    return () => {
      hotkeys.unbind(KEYBINDINGS.GENERAL.KEYBINDS.OPEN_WELCOME_TAB.SHORTCUTS);
      hotkeys.unbind(KEYBINDINGS.GENERAL.KEYBINDS.OPEN_SHORTCUTS_TAB.SHORTCUTS);
    };
  }, [addKeyBind, removeKeyBind, openWelcomeTab, openShortcutsTab]);

  //========================================================================================
  /*                                                                                      *
   *                                        Renders                                       *
   *                                                                                      */
  //========================================================================================

  return <div>KEYBINDS</div>;
};

AppKeybindings.propTypes = {
  call: PropTypes.func.isRequired
};

export default withViewPlugin(withKeyBinds(AppKeybindings));
