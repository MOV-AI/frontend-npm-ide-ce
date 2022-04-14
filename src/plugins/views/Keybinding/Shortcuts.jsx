import React, { useEffect } from "react";
import PropTypes from "prop-types";
import { withViewPlugin } from "../../../engine/ReactPlugin/ViewReactPlugin";
import { SHORTCUTS_PROFILE } from "../../../utils/Constants";

const AppKeybindings = props => {
  const { call, on, off } = props;

  //========================================================================================
  /*                                                                                      *
   *                                    React Lifecycle                                   *
   *                                                                                      */
  //========================================================================================

  useEffect(() => {}, [call, on, off]);

  //========================================================================================
  /*                                                                                      *
   *                                        Renders                                       *
   *                                                                                      */
  //========================================================================================

  return <div> Shortcut tabs!?</div>;
};

AppKeybindings.propTypes = {
  call: PropTypes.func.isRequired,
  on: PropTypes.func.isRequired
};

const AppKeybindingsPlugin = withViewPlugin(AppKeybindings);

export default AppKeybindingsPlugin;

/**
 * Get welcome tab data
 * @returns {TabData} Data used to create tab
 */
export const getShortcutsTab = () => {
  const viewPlugin = new AppKeybindingsPlugin(SHORTCUTS_PROFILE);

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
