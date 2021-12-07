import React from "react";
import Workspace from "../../../utils/Workspace";
import PluginManagerIDE from "../../../engine/PluginManagerIDE/PluginManagerIDE";
import AccountTreeIcon from "@material-ui/icons/AccountTree";
import BuildIcon from "@material-ui/icons/Build";
import CodeIcon from "@material-ui/icons/Code";
import DescriptionIcon from "@material-ui/icons/Description";
import DeviceHubIcon from "@material-ui/icons/DeviceHub";
import { Tooltip } from "@material-ui/core";

const DEFAULT_LAYOUT = {
  dockbox: {
    mode: "horizontal",
    children: []
  },
  windowbox: { children: [] },
  maxbox: { children: [] },
  floatbox: { children: [] }
};

const useLayout = (props, dockRef) => {
  const { emit, call, on } = props;
  const workspaceManager = React.useMemo(() => new Workspace(), []);
  const tabsById = React.useRef(new Map());
  const [layout, setLayout] = React.useState({ ...DEFAULT_LAYOUT });

  //========================================================================================
  /*                                                                                      *
   *                                    Private Methods                                   *
   *                                                                                      */
  //========================================================================================

  /**
   * Get first container in dockbox
   */
  const _getFirstContainer = React.useCallback(dockbox => {
    const boxData = dockbox.children[0];
    if (boxData?.tabs) return boxData;
    else return _getFirstContainer(boxData);
  }, []);

  /**
   * Find tab container recursively by tab id
   * @param {BoxData} box : Layout box data (can be dockbox, maxbox, floatbox or windowbox)
   * @param {String} tabId : Tab Id
   */
  const _getTabContainer = React.useCallback((box, tabId) => {
    if (box.activeId === tabId) return box;
    else if (box.children) {
      let containerBox = null;
      for (let i = 0; containerBox === null && i < box.children.length; i++) {
        const boxChildren = box.children[i];
        containerBox = _getTabContainer(boxChildren, tabId);
      }
      return containerBox;
    }
    return null;
  }, []);

  /**
   * Set new tab data in layout
   * @param {LayoutData} prevLayout : Previous layout data
   * @param {String} prevTabId : Previous tab id
   * @param {String} location : Layout data location (one of: "dockbox", "floatbox", "maxbox", "windowbox")
   * @param {TabData} tabData : New tab data to update previous tab id
   * @returns {{newLayout: LayoutData, box: BoxData}} : Returns new layout and box data (if any)
   */
  const _setTabInLayout = React.useCallback(
    (prevLayout, prevTabId, location, tabData) => {
      const newLayout = { ...prevLayout };
      const box = _getTabContainer(newLayout[location], prevTabId);
      if (box) {
        const tabIndex = box.tabs.findIndex(_el => _el.id === prevTabId);
        box.tabs[tabIndex] = tabData;
        box.activeId = tabData.id;
        tabsById.current.delete(prevTabId);
        tabsById.current.set(tabData.id, tabData);
        workspaceManager.setTabs(tabsById.current);
        workspaceManager.setLayout(newLayout);
      }
      return { newLayout, box };
    },
    [_getTabContainer, workspaceManager]
  );

  /**
   * Get tab to render
   * @param {{id: String, name: String, scope: String, extension: String}} docData : Document data
   * @param {Boolean} isDirty : Document dirty state
   * @returns {Element} Tab element to render
   */
  const _getCustomTab = React.useCallback((docData, isDirty) => {
    const getIconByScope = {
      Callback: style => <CodeIcon style={{ ...style }} />,
      Layout: style => <i className={`icon-Layouts`} style={{ ...style }}></i>,
      Flow: style => <AccountTreeIcon style={{ ...style }} />,
      Annotation: style => <DescriptionIcon style={{ ...style }} />,
      GraphicScene: style => <DeviceHubIcon style={{ ...style }} />,
      Node: style => <i className={`icon-Nodes`} style={{ ...style }}></i>,
      Configuration: style => <BuildIcon style={{ ...style }} />,
      Default: <></>
    };

    return (
      <Tooltip title={docData.id}>
        <div onAuxClick={() => console.log("debug close document", docData)}>
          {getIconByScope[docData.scope || "Default"]({
            fontSize: 12,
            marginTop: 2,
            marginRight: 10,
            marginLeft: 0
          })}
          {docData.name + docData.extension}
          {isDirty && " *"}
        </div>
      </Tooltip>
    );
  }, []);

  /**
   * Get tab data based in document data
   * @param {{id: String, title: String, name: String, scope: String}} docData : document basic data
   * @returns {TabData} Tab data to be set in Layout
   */
  const _getTabData = React.useCallback(
    async docData => {
      return props
        .call("docManager", "getDocFactory", docData.scope)
        .then(docFactory => {
          try {
            const Plugin = docFactory.plugin;
            const viewPlugin = new Plugin(
              { name: docData.id },
              { id: docData.id, name: docData.name, scope: docData.scope }
            );
            return PluginManagerIDE.install(docData.id, viewPlugin).then(() => {
              // Create and return tab data
              const extension = docFactory.store.model.EXTENSION || "";
              // Return TabData
              return {
                id: docData.id,
                name: docData.name,
                title: _getCustomTab(docData),
                extension: extension,
                scope: docData.scope,
                content: viewPlugin.render()
              };
            });
          } catch (err) {
            console.log("debug can't open tab", err);
            return docData;
          }
        });
    },
    [props, _getCustomTab]
  );

  //========================================================================================
  /*                                                                                      *
   *                                   React lifecycles                                   *
   *                                                                                      */
  //========================================================================================

  React.useEffect(() => {
    on("docManager", "updateDocDirty", data => {
      const { instance: model, value: isDirty } = data;
      const tabId = model.getUrl();
      const currentTabData = tabsById.current.get(tabId);
      // Doesn't trigger update if dirty state didn't change
      if (!currentTabData || currentTabData.isDirty === isDirty) return;
      // Set new dirty state
      const newTabData = { ...currentTabData, isDirty: isDirty };
      tabsById.current.set(tabId, newTabData);
      // Trigger tab update
      const currentTab = dockRef.current.find(tabId);
      dockRef.current.updateTab(tabId, currentTab);
    });
    return () => {
      workspaceManager.destroy();
    };
  }, [on, workspaceManager, dockRef]);

  React.useEffect(() => {
    const lastTabs = workspaceManager.getTabs();
    const lastLayout = workspaceManager.getLayout(DEFAULT_LAYOUT);
    const tabs = [];
    tabsById.current = lastTabs;
    // Install current tabs plugins
    [...lastTabs.keys()].forEach(tabId => {
      const { id, name, scope } = lastTabs.get(tabId);
      tabs.push(_getTabData({ id, name, scope }));
    });
    // after all plugins are installed
    Promise.all(tabs).then(_tabs => {
      _tabs.forEach(tab => tabsById.current.set(tab.id, tab));
      setLayout(lastLayout);
    });
  }, [workspaceManager, _getTabData]);

  //========================================================================================
  /*                                                                                      *
   *                                    Exposed Methods                                   *
   *                                                                                      */
  //========================================================================================

  /**
   * Open/Focus tab
   * @param {TabData} tabData : Set Tab data in Layout
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
            const firstContainer = _getFirstContainer(newState.dockbox);
            firstContainer.tabs.push(tabData);
            firstContainer.activeId = tabData.id;
          }
        }
        workspaceManager.setLayout(newState);
        return { ...newState };
      });
    },
    [dockRef, workspaceManager, _getFirstContainer]
  );

  /**
   * Open Editor tab from document data
   * @param {{id: String, title: String, name: String, scope: String}} docData : document basic data
   */
  const openEditor = React.useCallback(
    docData => {
      _getTabData(docData).then(tabData => {
        open(tabData);
      });
    },
    [_getTabData, open]
  );

  /**
   * Close Tab
   */
  const close = React.useCallback(() => {
    // Close tab dynamically
    console.log("removeTab");
    call("rightDrawer", "resetBookmarks");
  }, [call]);

  /**
   * Load tab data
   * @param {TabData} data : Tab data to load in Layout (might be missing information)
   * @returns {TabData} Complete tab data
   */
  const loadTab = React.useCallback(
    data => {
      const tabFromMemory = tabsById.current.get(data.id);
      if (!tabFromMemory && !data.content) return;
      const { id, content, scope, name, extension, isDirty } =
        tabFromMemory || data;
      tabsById.current.set(id, {
        id,
        scope,
        name,
        content,
        extension,
        isDirty
      });
      const tabData = { id, scope, name, extension };
      return {
        id: id,
        title: _getCustomTab(tabData, isDirty),
        content: content,
        closable: true
      };
    },
    [_getCustomTab]
  );

  /**
   * Triggered at any manual layout/active tab change
   * @param {LayoutData} newLayout : New Layout data
   * @param {String} tabId : Tab ID
   * @param {String} direction : (one of: "left" | "right" | "bottom" | "top" | "middle" | "remove" | "before-tab" | "after-tab" | "float" | "front" | "maximize" | "new-window")
   */
  const onLayoutChange = React.useCallback(
    (newLayout, tabId, direction) => {
      const firstContainer = _getFirstContainer(newLayout.dockbox);
      const newActiveTab =
        direction !== "remove" ? tabId : firstContainer.activeId;
      setLayout(newLayout);
      // Remove tab from local list when it's removed
      if (direction === "remove") {
        tabsById.current.delete(tabId);
        workspaceManager.setTabs(tabsById.current);
      }
      workspaceManager.setLayout(newLayout);
      if (!tabId) return;
      if (newActiveTab) emit(`${newActiveTab}-active`);
      else call("rightDrawer", "resetBookmarks");
    },
    [_getFirstContainer, emit, call, workspaceManager]
  );

  /**
   * Update tab ID and data
   * @param {String} prevTabId : Old tab ID
   * @param {{id: String, name: String, scope: String}} docData : document basic data
   */
  const updateTabId = React.useCallback(
    (prevTabId, newTabData) => {
      _getTabData(newTabData).then(tabData => {
        setLayout(prevState => {
          // look for tab in windowbox
          const w = _setTabInLayout(prevState, prevTabId, "windowbox", tabData);
          if (w.box) return w.newLayout;
          // look for tab in maxbox
          const max = _setTabInLayout(prevState, prevTabId, "maxbox", tabData);
          if (max.box) return max.newLayout;
          // look for tab in floatbox
          const f = _setTabInLayout(prevState, prevTabId, "floatbox", tabData);
          if (f.box) return f.newLayout;
          // look for tab in dockbox
          const d = _setTabInLayout(prevState, prevTabId, "dockbox", tabData);
          if (d.box) return d.newLayout;
          return prevState;
        });
      });
    },
    [_getTabData, _setTabInLayout]
  );

  //========================================================================================
  /*                                                                                      *
   *                             Return Exposed Methods                                   *
   *                                                                                      */
  //========================================================================================

  return {
    layout,
    open,
    openEditor,
    close,
    loadTab,
    onLayoutChange,
    updateTabId
  };
};

export default useLayout;
