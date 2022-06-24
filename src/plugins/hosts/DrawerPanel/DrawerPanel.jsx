import React, { forwardRef, useState } from "react";
import PropTypes from "prop-types";
import { Drawer, Typography } from "@material-ui/core";
import { HOSTS } from "../../../utils/Constants";
import { withHostReactPlugin } from "../../../engine/ReactPlugin/HostReactPlugin";
import { usePluginMethods } from "../../../engine/ReactPlugin/ViewReactPlugin";
import withBookmarks, {
  exposedMethods
} from "../../../decorators/withBookmarks";

import { drawerPanelStyles } from "./styles";

const DrawerPanel = forwardRef((props, ref) => {
  const { viewPlugins, hostName, style, anchor, initialOpenState, className } =
    props;
  const [open, setOpen] = useState(initialOpenState);
  const classes = drawerPanelStyles(anchor === "left", open)();

  //========================================================================================
  /*                                                                                      *
   *                                   Component's methods                                *
   *                                                                                      */
  //========================================================================================

  /**
   * Toggle drawer
   */
  const toggleDrawer = () => {
    setOpen(prevState => {
      return !prevState;
    });
  };

  /**
   * Open Drawer
   */
  const openDrawer = () => {
    setOpen(true);
  };

  /**
   * Close Drawer
   */
  const closeDrawer = () => {
    setOpen(false);
  };

  //========================================================================================
  /*                                                                                      *
   *                                   React lifecycles                                   *
   *                                                                                      */
  //========================================================================================

  /**
   * Expose methods
   */
  usePluginMethods(ref, {
    toggleDrawer,
    openDrawer,
    closeDrawer
  });

  //========================================================================================
  /*                                                                                      *
   *                                         Render                                       *
   *                                                                                      */
  //========================================================================================

  return (
    <Drawer
      id={hostName}
      open={open}
      anchor={anchor}
      variant="persistent"
      style={{ ...style }}
      className={`${classes.drawer} ${className}`}
    >
      <Typography component="div" className={classes.content}>
        {viewPlugins}
        {props.children}
      </Typography>
    </Drawer>
  );
});

DrawerPanel.pluginMethods = [
  ...exposedMethods,
  HOSTS.LEFT_DRAWER.CALL.OPEN,
  HOSTS.LEFT_DRAWER.CALL.CLOSE,
  HOSTS.LEFT_DRAWER.CALL.TOGGLE
];

export default withHostReactPlugin(
  withBookmarks(DrawerPanel),
  DrawerPanel.pluginMethods
);

DrawerPanel.propTypes = {
  hostName: PropTypes.string.isRequired,
  initialOpenState: PropTypes.bool
};

DrawerPanel.defaultProps = {
  initialOpenState: false
};
