import { makeStyles } from "@material-ui/core/styles";
import PropTypes from "prop-types";
import DockLayout from "rc-dock";
import "rc-dock/dist/rc-dock.css";
import React from "react";
import {
  withViewPlugin,
  usePluginMethods
} from "../../../engine/ReactPlugin/ViewReactPlugin";

const useStyles = makeStyles(theme => ({
  root: {
    position: "relative",
    width: "100%",
    height: "100%",
    "& .dock-layout": {
      width: "100%",
      height: "100%",
      "& .dock-panel": {
        borderColor: theme.palette.background.default,
        "& .dock-bar": {
          borderColor: theme.background,
          background: theme.palette.background.primary,
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
          background: theme.palette.background.primary
        }
      },
      "& .dock-style-place-holder": {
        background: theme.palette.background.default
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

const DEFAULT_LAYOUT = {
  dockbox: {
    mode: "horizontal",
    children: []
  }
};

const useLayout = (props, dockRef) => {
  const tabsById = React.useRef(new Map());
  const dockLayout = dockRef.current;
  const [layout, setLayout] = React.useState({ ...DEFAULT_LAYOUT });

  /**
   * Open/Focus tab
   */
  const open = React.useCallback(
    tabData => {
      tabsById.current.set(tabData.id, tabData);
      const getFirstContainer = dockbox => {
        if (dockbox.children[0]?.tabs) return dockbox.children[0];
        else return getFirstContainer(dockbox.children[0]);
      };

      setLayout(prevState => {
        const newState = { ...prevState };
        // If is first tab
        if (newState.dockbox.children.length === 0) {
          newState.dockbox.children = [{ tabs: [tabData] }];
        } else {
          const existingTab = dockLayout.find(tabData.id);
          if (existingTab) dockLayout.updateTab(tabData.id, tabData);
          else {
            const firstContainer = getFirstContainer(newState.dockbox);
            firstContainer.tabs.push(tabData);
            firstContainer.activeId = tabData.id;
          }
        }
        return { ...newState };
      });
    },
    [dockLayout]
  );

  /**
   * Close Tab
   */
  const close = React.useCallback(() => {
    // Close tab dynamically
    console.log("removeTab");
  }, []);

  /**
   * Load tab data
   * @param {*} data
   * @returns
   */
  const loadTab = data => {
    const tabFromMemory = tabsById.current.get(data.id);
    if (!tabFromMemory && !data.title && !data.content) return;
    const { id, title, content } = tabFromMemory || data;
    tabsById.current.set(id, { id, title, content });
    return {
      id: id,
      title: title,
      content: content,
      closable: true
    };
  };

  /**
   * Triggered at any manual layout change
   * @param {*} newLayout
   */
  const onLayoutChange = (newLayout, tabId, direction) => {
    setLayout(newLayout);
    if (!tabId) return;
    props.call("rightDrawer", "resetBookmarks").then(() => {
      props.emit(`${tabId}-active`);
    });
  };

  return { layout, open, close, loadTab, onLayoutChange };
};

const Tabs = (props, ref) => {
  const classes = useStyles();
  const dockRef = React.useRef();
  const { layout, open, close, onLayoutChange, loadTab } = useLayout(
    props,
    dockRef
  );

  usePluginMethods(ref, {
    open,
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

Tabs.pluginMethods = ["open", "close"];

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
