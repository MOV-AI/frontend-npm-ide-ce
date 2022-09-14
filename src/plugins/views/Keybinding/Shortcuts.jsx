import React, { useEffect, useState, useRef } from "react";
import PropTypes from "prop-types";
import { withViewPlugin } from "../../../engine/ReactPlugin/ViewReactPlugin";
import { PLUGINS, SHORTCUTS_PROFILE } from "../../../utils/Constants";
import ShortcutsList from "./components/ShortcutsList";
import ShortcutsTable from "./components/ShortcutsTable";
import { KEYBINDINGS } from "./shortcuts";

import { shortcutsStyles } from "./styles";

const Shortcuts = props => {
  const { call, off, on } = props;

  // Hooks
  const shortcutsData = useRef(formatData(KEYBINDINGS));
  const [selectedScope, setSelectedScope] = useState(KEYBINDINGS.GENERAL.NAME);

  // Style hook
  const classes = shortcutsStyles();

  //========================================================================================
  /*                                                                                      *
   *                                    Private Methods                                   *
   *                                                                                      */
  //========================================================================================

  function formatData(data) {
    const formattedData = {
      scopes: []
    };
    Object.values(data).forEach(value => {
      formattedData.scopes.push({
        id: value.NAME,
        label: value.LABEL,
        description: value.DESCRIPTION
      });
      formattedData[value.NAME] = [];

      Object.values(value.KEYBINDS).forEach(keybind => {
        formattedData[value.NAME].push({
          id: keybind.NAME,
          label: keybind.LABEL,
          description: keybind.DESCRIPTION,
          shortcut: keybind.SHORTCUTS
        });
      });
    });

    return formattedData;
  }

  //========================================================================================
  /*                                                                                      *
   *                                    React Lifecycle                                   *
   *                                                                                      */
  //========================================================================================

  useEffect(() => {
    call(PLUGINS.RIGHT_DRAWER.NAME, PLUGINS.RIGHT_DRAWER.CALL.RESET_BOOKMARKS);
    on(PLUGINS.TABS.NAME, PLUGINS.TABS.ON.ACTIVE_TAB_CHANGE, data => {
      if (data.id === SHORTCUTS_PROFILE.name) {
        call(
          PLUGINS.RIGHT_DRAWER.NAME,
          PLUGINS.RIGHT_DRAWER.CALL.RESET_BOOKMARKS
        );
      }
    });
    return () => {
      off(PLUGINS.TABS.NAME, PLUGINS.TABS.ON.ACTIVE_TAB_CHANGE);
    };
  }, [call, on, off]);

  //========================================================================================
  /*                                                                                      *
   *                                        Renders                                       *
   *                                                                                      */
  //========================================================================================

  return (
    <div data-testid="section_shortcuts" className={classes.root}>
      <div className={classes.body}>
        <div className={classes.smallColumn}>
          <ShortcutsList
            scopes={shortcutsData.current.scopes}
            setSelectedScope={setSelectedScope}
            selectedScope={selectedScope}
          />
        </div>
        <div className={classes.bigColumn}>
          <ShortcutsTable
            scope={shortcutsData.current.scopes.find(
              s => s.id === selectedScope
            )}
            data={shortcutsData.current[selectedScope]}
          />
        </div>
      </div>
    </div>
  );
};

Shortcuts.propTypes = {
  call: PropTypes.func.isRequired,
  on: PropTypes.func.isRequired
};

const ShortcutsPlugin = withViewPlugin(Shortcuts);

export default ShortcutsPlugin;

/**
 * Get welcome tab data
 * @returns {TabData} Data used to create tab
 */
export const getShortcutsTab = () => {
  const viewPlugin = new ShortcutsPlugin(SHORTCUTS_PROFILE);

  return {
    ...SHORTCUTS_PROFILE,
    id: SHORTCUTS_PROFILE.name,
    name: SHORTCUTS_PROFILE.title,
    tabTitle: SHORTCUTS_PROFILE.title,
    scope: SHORTCUTS_PROFILE.name,
    extension: "",
    content: viewPlugin.render()
  };
};
