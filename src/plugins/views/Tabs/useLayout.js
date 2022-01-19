import React, { useCallback, useEffect, useMemo, useState, useRef } from "react";
import { Tooltip } from "@material-ui/core";
import { getIconByScope } from "../../../utils/Utils";
import PluginManagerIDE from "../../../engine/PluginManagerIDE/PluginManagerIDE";
import Workspace from "../../../utils/Workspace";
import HomeTab from "../HomeTab/HomeTab";
import TOPICS from "./topics";

const HomeTabProfile = { name: "HomeTab", title: "Welcome" };
const DEFAULT_LAYOUT = {
  dockbox: {
    mode: "horizontal",
    children: [{tabs: [{
      id: HomeTabProfile.name,
    }]}]
  },
  windowbox: { children: [] },
  maxbox: { children: [] },
  floatbox: { children: [] }
};

const useLayout = (props, dockRef) => {
  const { emit, call, on } = props;
  const workspaceManager = useMemo(() => new Workspace(), []);
  const tabsById = useRef(new Map());
  const [layout, setLayout] = useState({ ...DEFAULT_LAYOUT });

  //========================================================================================
  /*                                                                                      *
   *                                    Private Methods                                   *
   *                                                                                      */
  //========================================================================================

  /**
   * Apply layout and save changes
   * @param {LayoutData} layout
   */
  const _applyLayout = useCallback(
    _layout => {
      setLayout(_layout);
      workspaceManager.setLayout(_layout);
    },
    [workspaceManager]
  );

  /**
   * Get first container in dockbox
   */
  const _getFirstContainer = useCallback(dockbox => {
    const boxData = dockbox.children[0];
    if (boxData?.tabs) return boxData;
    else return _getFirstContainer(boxData);
  }, []);

  /**
   * Find tab container recursively by tab id
   * @param {BoxData} box : Layout box data (can be dockbox, maxbox, floatbox or windowbox)
   * @param {String} tabId : Tab Id
   */
  const _getTabContainer = useCallback((box, tabId) => {
    if (box?.tabs?.map(el => el.id).includes(tabId)) return box;
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
  const _setTabInLayout = useCallback(
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
  const _getCustomTab = useCallback((docData, onCloseTab, isDirty) => {

    return (
      <Tooltip title={docData.tabTitle || docData.id}>
        <div onAuxClick={() => onCloseTab(docData.id)}>
          {getIconByScope(docData.scope, {
            fontSize: 13,
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
   * Save document and apply layout
   * @param {{name: string, scope: string}} docData
   * @param {LayoutData} newLayout : New layout to apply (optional)
   */
  const _saveDoc = useCallback(
    (docData, newLayout) => {
      const { name, scope } = docData;
      call("docManager", "save", { name, scope })
        .then(res => {
          if (res.success) {
            if (newLayout) _applyLayout(newLayout);
            call("alert", "show", {
              message: "Saved successfully",
              severity: "success"
            });
          }
        })
        .catch(err => {
          console.log("failed to save", err);
          call("alert", "show", {
            message: "Failed to save",
            severity: "error"
          });
        });
    },
    [call, _applyLayout]
  );

  /**
   * Discard changes and apply layout
   * @param {{name: string, scope: string}} docData
   * @param {LayoutData} newLayout : New layout to apply (optional)
   */
  const _discardChanges = useCallback(
    (docData, newLayout) => {
      const { name, scope } = docData;
      call("docManager", "discardDocChanges", { name, scope }).then(() => {
        if (newLayout) _applyLayout(newLayout);
      });
    },
    [call, _applyLayout]
  );

  /**
   * Open dialog before closing tab in dirty state
   * @param {string} name : Document name
   * @param {string} scope : Document scope
   * @param {LayoutData} newLayout : New layout
   */
  const _closeDirtyTab = useCallback(
    (name, scope, newLayout) => {
      call("dialog", "closeDirtyDocument", {
        name,
        scope,
        onSubmit: action => {
          const triggerAction = {
            // Save changes and close document
            save: () => _saveDoc({ name, scope }, newLayout),
            // Discard changes and close document
            dontSave: () => _discardChanges({ name, scope }, newLayout)
          };
          return action in triggerAction ? triggerAction[action]() : false;
        }
      });
    },
    [call, _saveDoc, _discardChanges]
  );

  /**
   * On dock layout remove tab
   * @param {LayoutData} newLayout : New layout data
   * @param {string} tabId : Tab id
   */
  const _onLayoutRemoveTab = useCallback(
    (newLayout, tabId) => {
      const { name, scope, isNew, isDirty } = tabsById.current.get(tabId);
      if (isDirty) {
        _closeDirtyTab(name, scope, newLayout);
      } else {
        // Remove doc locally if is new and not dirty
        if (isNew) call("docManager", "discardDocChanges", { name, scope });
        // Remove tab and apply new layout
        tabsById.current.delete(tabId);
        workspaceManager.setTabs(tabsById.current);
        _applyLayout(newLayout);
        // Reset bookmarks
        call("rightDrawer", "resetBookmarks");
      }
    },
    [call, workspaceManager, _applyLayout, _closeDirtyTab]
  );

  /**
   * Delete tab from layout
   * @param {LayoutData} prevLayout : Previous layout (including tab to be removed)
   * @param {string} tabId : Tab id
   * @param {String} location : Layout data location (one of: "dockbox", "floatbox", "maxbox", "windowbox")
   * @returns {BoxData} Return found box data or null if not found in location
   */
  const _deleteTabFromLayout = useCallback(
    (prevLayout, tabId, location) => {
      const newLayout = { ...prevLayout };
      const box = _getTabContainer(newLayout[location], tabId);
      if (box) {
        box.tabs = box.tabs.filter(_el => _el.id !== tabId);
        _onLayoutRemoveTab(newLayout, tabId);
      }
      return box;
    },
    [_getTabContainer, _onLayoutRemoveTab]
  );

  /**
   * Close tab : Remove from layout
   * @param {string} tabId : Tab ID (document URL)
   * @returns {LayoutData} : Layout without tab
   */
  const _closeTab = useCallback(
    tabId => {
      const tabData = dockRef.current.find(tabId);
      if (!tabData) return;
      const currentLayout = dockRef.current.saveLayout();
      const locations = ["windowbox", "maxbox", "floatbox", "dockbox"];
      // look for tab in layout locations
      for (const location of locations) {
        const found = _deleteTabFromLayout(currentLayout, tabId, location);
        if (found) return;
      }
    },
    [dockRef, _deleteTabFromLayout]
  );

  /**
   * Update document dirty state
   * @param {{instance: Model, value: Boolean}} data
   */
  const _updateDocDirty = useCallback(
    data => {
      const { instance: model, value: isDirty } = data;
      const tabId = model.getUrl();
      const currentTabData = tabsById.current.get(tabId);
      // Doesn't trigger update if dirty state didn't change
      if (!currentTabData || currentTabData.isDirty === isDirty) return;
      // Set new dirty state
      const newTabData = { ...currentTabData, isDirty: isDirty };
      tabsById.current.set(tabId, newTabData);
      // Trigger tab update
      if (!dockRef.current) return;
      const currentTab = dockRef.current.find(tabId);
      dockRef.current.updateTab(tabId, currentTab);
    },
    [dockRef]
  );

  /**
   * Get tab data based in document data
   * @param {{id: String, title: String, name: String, scope: String}} docData : document basic data
   * @returns {TabData} Tab data to be set in Layout
   */
  const _getTabData = useCallback(
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
              const extension = docFactory.store.model.EXTENSION ?? "";
              // Return TabData
              return {
                id: docData.id,
                name: docData.name,
                isNew: docData.isNew,
                title: _getCustomTab(docData, _closeTab),
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
    [props, _getCustomTab, _closeTab]
  );

  /**
   * Installs the HomeTab Plugin
   * @private
   * @returns the HomeTab
   */
  const installHomeTabPlugin = useCallback(() => {
    const viewPlugin = new HomeTab(
      HomeTabProfile,
      { workspaceManager }
    );

    return PluginManagerIDE.install(HomeTabProfile.name, viewPlugin).then(() => {
      // Create and return tab data
      // Return TabData
      return {
        id: HomeTabProfile.name,
        name: HomeTabProfile.title,
        tabTitle: HomeTabProfile.title,
        scope: HomeTabProfile.name,
        extension: "",
        content: viewPlugin.render()
      };
    });
  }, [workspaceManager]);

  //========================================================================================
  /*                                                                                      *
   *                                    Exposed Methods                                   *
   *                                                                                      */
  //========================================================================================

  /**
   * Open/Focus tab
   * @param {TabData} tabData : Set Tab data in Layout
   */
  const open = useCallback(
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
  const openEditor = useCallback(
    docData => {
      _getTabData(docData).then(tabData => {
        emit(TOPICS.openEditor, tabData);
        open(tabData);
      });
    },
    [emit, _getTabData, open]
  );

  /**
   * Close Tab
   */
  const close = useCallback(() => {
    // Close tab dynamically
    console.log("removeTab");
    call("rightDrawer", "resetBookmarks");
  }, [call]);

  /**
   * Load tab data
   * @param {TabData} data : Tab data to load in Layout (might be missing information)
   * @returns {TabData} Complete tab data
   */
  const loadTab = useCallback(
    data => {
      const tabFromMemory = tabsById.current.get(data.id);
      if (!tabFromMemory && !data.content) return;
      const { id, content, scope, name, tabTitle, extension, isDirty, isNew } =
        tabFromMemory ?? data;
      tabsById.current.set(id, {
        id,
        scope,
        name,
        tabTitle,
        content,
        extension,
        isNew,
        isDirty
      });
      const tabData = { id, scope, name, tabTitle, extension };
      return {
        id: id,
        title: _getCustomTab(tabData, _closeTab, isDirty),
        content: content,
        closable: true
      };
    },
    [_getCustomTab, _closeTab]
  );

  /**
   * Triggered at any manual layout/active tab change
   * @param {LayoutData} newLayout : New Layout data
   * @param {String} tabId : Tab ID
   * @param {String} direction : (one of: "left" | "right" | "bottom" | "top" | "middle" | "remove" | "before-tab" | "after-tab" | "float" | "front" | "maximize" | "new-window")
   */
  const onLayoutChange = useCallback(
    (newLayout, tabId, direction) => {
      const firstContainer = _getFirstContainer(newLayout.dockbox);
      const newActiveTab =
        direction !== "remove" ? tabId : firstContainer.activeId;
      // Attempt to close tab
      if (direction === "remove") {
        _onLayoutRemoveTab(newLayout, tabId);
      } else {
        // Update layout
        _applyLayout(newLayout);
      }
      // Emit new active tab id
      if (!tabId) return;
      if (newActiveTab) emit(`${newActiveTab}-active`);
      else call("rightDrawer", "resetBookmarks");
    },
    [emit, call, _getFirstContainer, _onLayoutRemoveTab, _applyLayout]
  );

  /**
   * Update tab ID and data
   * @param {String} prevTabId : Old tab ID
   * @param {{id: String, name: String, scope: String}} docData : document basic data
   */
  const updateTabId = useCallback(
    (prevTabId, newTabData) => {
      _getTabData(newTabData).then(tabData => {
        setLayout(prevState => {
          // look for tab in windowbox
          const locations = ["windowbox", "maxbox", "floatbox", "dockbox"];
          for (const location of locations) {
            const f = _setTabInLayout(prevState, prevTabId, location, tabData);
            if (f.box) return f.newLayout;
          }
          return prevState;
        });
      });
    },
    [_getTabData, _setTabInLayout]
  );

  //========================================================================================
  /*                                                                                      *
   *                                   React lifecycles                                   *
   *                                                                                      */
  //========================================================================================

  /**
   * Add Events Listeners
   */
  useEffect(() => {
    // Update doc dirty state
    on("docManager", "updateDocDirty", data => _updateDocDirty(data));
    // On delete document
    on("docManager", "deleteDoc", data => _closeTab(data.url));
  }, [on, emit, _updateDocDirty, _closeTab]);

  /**
   * Load workspace
   */
  useEffect(() => {
    let lastLayout = workspaceManager.getLayout(DEFAULT_LAYOUT);
    const lastTabs = workspaceManager.getTabs();
    const tabs = [];

    if(!lastTabs.size){
      lastTabs.set(HomeTabProfile.name, { id: HomeTabProfile.name });
      lastLayout = DEFAULT_LAYOUT;
    }

    tabsById.current = lastTabs;
    // Install current tabs plugins
    lastTabs.forEach(tab => {
      const { id, name, scope } = tab;
      
      if(id === HomeTabProfile.name)
        tabs.push(installHomeTabPlugin());
      else
        tabs.push(_getTabData({ id, name, scope }));
    });
    // after all plugins are installed
    Promise.allSettled(tabs).then(_tabs => {
      _tabs.forEach(tab => tab.status === "fulfilled" && tabsById.current.set(tab.value.id, tab.value));
      setLayout(lastLayout);
    });
    // Destroy local workspace manager instance on unmount
    return () => {
      workspaceManager.destroy();
    };
  }, [workspaceManager, on, call, installHomeTabPlugin, _closeTab, _getTabData, open]);

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
