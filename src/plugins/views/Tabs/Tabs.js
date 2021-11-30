import React from "react";
import PropTypes from "prop-types";
import DockLayout from "rc-dock";
import Workspace from "../../../utils/Workspace";
import { makeStyles } from "@material-ui/core/styles";
import "rc-dock/dist/rc-dock.css";
import {
  withViewPlugin,
  usePluginMethods
} from "../../../engine/ReactPlugin/ViewReactPlugin";
import PluginManagerIDE from "../../../engine/PluginManagerIDE/PluginManagerIDE";

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

const DEFAULT_LAYOUT = {
  dockbox: {
    mode: "horizontal",
    children: []
  }
};

const useLayout = (props, dockRef) => {
  const workspaceManager = React.useMemo(() => new Workspace(), []);
  const tabsById = React.useRef(new Map());
  const [layout, setLayout] = React.useState({ ...DEFAULT_LAYOUT });

  const getFirstContainer = React.useCallback(dockbox => {
    const boxData = dockbox.children[0];
    if (boxData?.tabs) return boxData;
    else return getFirstContainer(boxData);
  }, []);

  const getTabData = React.useCallback(
    async docData => {
      return props
        .call("docManager", "getDocPlugin", docData.scope)
        .then(plugin => {
          try {
            const viewPlugin = new plugin(
              { name: docData.id },
              { id: docData.id, name: docData.name, scope: docData.scope }
            );
            return PluginManagerIDE.install(docData.id, viewPlugin).then(() => {
              // Create and return tab data
              const tabData = {
                id: docData.id,
                name: docData.name,
                title: docData.title,
                scope: docData.scope,
                content: viewPlugin.render()
              };
              return tabData;
            });
          } catch (err) {
            console.log("can't open tab", err);
            return docData;
          }
        });
    },
    [props]
  );

  React.useEffect(() => {
    return () => {
      workspaceManager.destroy();
    };
  }, [workspaceManager]);

  React.useEffect(() => {
    const lastTabs = workspaceManager.getTabs();
    const lastLayout = workspaceManager.getLayout(DEFAULT_LAYOUT);
    const tabs = [];
    tabsById.current = lastTabs;
    // Install current tabs plugins
    [...lastTabs.keys()].forEach(tabId => {
      const { id, name, title, scope } = lastTabs.get(tabId);
      tabs.push(getTabData({ id, name, title, scope }));
    });
    // after all plugins are installed
    Promise.all(tabs).then(_tabs => {
      _tabs.forEach(tab => tabsById.current.set(tab.id, tab));
      setLayout(lastLayout);
    });
  }, [dockRef, workspaceManager, getTabData]);

  /**
   * Open/Focus tab
   */
  const open = React.useCallback(
    tabData => {
      tabsById.current.set(tabData.id, tabData);
      workspaceManager.setTabs(tabsById.current);

      setLayout(prevState => {
        const newState = { ...prevState };
        // If is first tab
        if (newState.dockbox.children.length === 0) {
          newState.dockbox.children = [{ tabs: [tabData] }];
        } else {
          const existingTab = dockRef.current.find(tabData.id);
          if (existingTab) dockRef.current.updateTab(tabData.id, tabData);
          else {
            const firstContainer = getFirstContainer(newState.dockbox);
            firstContainer.tabs.push(tabData);
            firstContainer.activeId = tabData.id;
          }
        }
        workspaceManager.setLayout(newState);
        return { ...newState };
      });
    },
    [dockRef, workspaceManager, getFirstContainer]
  );

  const openEditor = React.useCallback(
    docData => {
      getTabData(docData).then(tabData => {
        open(tabData);
      });
    },
    [getTabData, open]
  );

  /**
   * Close Tab
   */
  const close = React.useCallback(() => {
    // Close tab dynamically
    console.log("removeTab");
    props.call("rightDrawer", "resetBookmarks");
  }, [props]);

  /**
   * Load tab data
   * @param {*} data
   * @returns
   */
  const loadTab = data => {
    const tabFromMemory = tabsById.current.get(data.id);
    if (!tabFromMemory && !data.title && !data.content) return;
    const { id, title, content, scope, name } = tabFromMemory || data;
    tabsById.current.set(id, { id, title, scope, name, content });
    return {
      id: id,
      title: title,
      content: content,
      closable: true
    };
  };

  /**
   * Triggered at any manual layout/active tab change
   * @param {*} newLayout
   */
  const onLayoutChange = (newLayout, tabId, direction) => {
    const firstContainer = getFirstContainer(newLayout.dockbox);
    const newActiveTab =
      direction !== "remove" ? tabId : firstContainer.activeId;
    setLayout(newLayout);
    workspaceManager.setLayout(newLayout);
    if (!tabId) return;
    if (newActiveTab) props.emit(`${newActiveTab}-active`);
    else props.call("rightDrawer", "resetBookmarks");
  };

  return { layout, open, openEditor, close, loadTab, onLayoutChange };
};

const Tabs = (props, ref) => {
  const classes = useStyles();
  const dockRef = React.useRef();
  const { layout, open, openEditor, close, onLayoutChange, loadTab } =
    useLayout(props, dockRef);

  usePluginMethods(ref, {
    open,
    openEditor,
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

Tabs.pluginMethods = ["open", "openEditor", "close"];

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
