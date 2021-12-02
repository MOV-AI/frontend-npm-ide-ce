import React from "react";
import PropTypes from "prop-types";
import DockLayout from "rc-dock";
import { makeStyles } from "@material-ui/core/styles";
import "rc-dock/dist/rc-dock.css";
import {
  withViewPlugin,
  usePluginMethods
} from "../../../engine/ReactPlugin/ViewReactPlugin";
import useLayout from "./useLayout";

const useStyles = makeStyles(theme => ({
  "@global": {
    ".dock-dropdown-menu": {
      background: theme.palette.background.default
    },
    ".dock-dropdown-menu-item": {
      color: theme.palette.text.primary,
      background: theme.palette.background.default
    },
    ".dock-dropdown-menu-item-active:hover": {
      background: theme.palette.background.primary
    }
  },
  root: {
    position: "relative",
    width: "100%",
    height: "100%",
    "& .dock-layout": {
      width: "100%",
      height: "100%",
      "& .dock-panel": {
        background: theme.palette.background.default,
        borderColor: theme.palette.background.default,
        "& .dock-bar": {
          borderColor: theme.background,
          background: theme.palette.background.primary,
          "& .dock-nav-more": {
            color: theme.palette.text.primary
          },
          "& .dock-tab": {
            borderTopLeftRadius: 5,
            borderTopRightRadius: 5,
            background: theme.backdrop.background,
            color: theme.backdrop.color,
            padding: "0 10px",
            "& .dock-tab-close-btn": {
              right: "1px"
            }
          },
          "& .dock-ink-bar": {
            backgroundColor: theme.palette.primary.main
          }
        },
        "& .dock-drop-layer .dock-drop-square": {
          background: theme.palette.background.primary,
          color: theme.backdrop.color,
          borderColor: `${theme.backdrop.color}95`
        }
      },
      "& .dock-style-place-holder": {
        background: theme.palette.background.default
      },
      "& .dock-divider": {
        background: `${theme.palette.background.primary}95`
      }
    }
  },
  dockLayout: {
    position: "absolute",
    left: 10,
    top: 10,
    right: 10,
    bottom: 10
  }
}));

const Tabs = (props, ref) => {
  const classes = useStyles();
  const dockRef = React.useRef();
  const {
    layout,
    open,
    openEditor,
    close,
    onLayoutChange,
    loadTab,
    updateTabId
  } = useLayout(props, dockRef);

  usePluginMethods(ref, {
    open,
    openEditor,
    updateTabId,
    close
  });

  return (
    <div className={classes.root}>
      <DockLayout
        ref={dockRef}
        layout={layout}
        loadTab={loadTab}
        onLayoutChange={onLayoutChange}
        className={classes.dockLayout}
      />
    </div>
  );
};

Tabs.pluginMethods = ["open", "openEditor", "close", "updateTabId"];

export default withViewPlugin(Tabs, Tabs.pluginMethods);

Tabs.propTypes = {
  call: PropTypes.func.isRequired,
  on: PropTypes.func.isRequired,
  emit: PropTypes.func.isRequired,
  onTopic: PropTypes.func.isRequired,
  profile: PropTypes.object.isRequired
};

Tabs.defaultProps = {
  profile: { name: "tabs" }
};
