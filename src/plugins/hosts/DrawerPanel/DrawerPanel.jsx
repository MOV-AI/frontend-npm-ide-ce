import { Drawer } from "@mui/material";
import { makeStyles } from "@mui/styles";
import PropTypes from "prop-types";
import React from "react";
import { withHostReactPlugin } from "../../../engine/ReactPlugin/HostReactPlugin";
import { usePluginMethods } from "../../../engine/ReactPlugin/ViewReactPlugin";
import withBookmarks, {
  exposedMethods
} from "../../views/editors/_shared/withBookmarks";

const useStyles = (isLeft, isOpen) =>
  makeStyles({
    drawer: {
      overflow: "hidden",
      position: "relative",
      [isLeft ? "marginRight" : "marginLeft"]: "auto",
      width: isOpen ? 340 : "auto",
      height: "100%",
      "& .MuiBackdrop-root": {
        display: "none"
      },
      "& .MuiDrawer-paper": {
        width: 340,
        position: "absolute",
        transition: "none !important"
      }
    }
  });

const DrawerPanel = React.forwardRef((props, ref) => {
  const { viewPlugins, onTopic, hostName, style, anchor, initialOpenState } =
    props;
  const [open, setOpen] = React.useState(initialOpenState);
  const classes = useStyles(anchor === "left", open)();

  //========================================================================================
  /*                                                                                      *
   *                                   Component's methods                                *
   *                                                                                      */
  //========================================================================================

  /**
   * Toggle drawer
   */
  const toggleDrawer = React.useCallback(() => {
    setOpen(prevState => {
      return !prevState;
    });
  }, []);

  /**
   * Open Drawer
   */
  const openDrawer = React.useCallback(() => {
    setOpen(true);
  }, []);

  /**
   * Close Drawer
   */
  const closeDrawer = React.useCallback(() => {
    setOpen(false);
  }, []);

  //========================================================================================
  /*                                                                                      *
   *                                   React lifecycles                                   *
   *                                                                                      */
  //========================================================================================

  React.useEffect(() => {
    // Handle drawer toggle
    onTopic(`toggle-${hostName}`, toggleDrawer);
    // Handle dynamic drawer open
    onTopic(`open-${hostName}`, openDrawer);
    // Handle dynamic drawer close
    onTopic(`close-${hostName}`, closeDrawer);
  }, [onTopic, hostName, toggleDrawer, openDrawer, closeDrawer]);

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
      className={classes.drawer}
    >
      {props.children}
      {viewPlugins}
    </Drawer>
  );
});

DrawerPanel.pluginMethods = [...exposedMethods];

export default withHostReactPlugin(
  withBookmarks(DrawerPanel),
  DrawerPanel.pluginMethods
);

DrawerPanel.propTypes = {
  hostName: PropTypes.string.isRequired,
  initialOpenState: PropTypes.bool
};

DrawerPanel.defaultProps = {
  hostName: "drawer",
  initialOpenState: false
};
