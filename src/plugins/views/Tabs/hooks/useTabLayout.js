import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useRef
} from "react";
import { Tooltip } from "@material-ui/core";
import {
  HOMETAB_PROFILE,
  SHORTCUTS_PROFILE,
  DEFAULT_LAYOUT,
  DOCK_POSITIONS,
  DOCK_MODES,
  PLUGINS
} from "../../../../utils/Constants";
import { getIconByScope, buildDocPath } from "../../../../utils/Utils";
import PluginManagerIDE from "../../../../engine/PluginManagerIDE/PluginManagerIDE";
import Workspace from "../../../../utils/Workspace";
import { getHomeTab } from "../../HomeTab/HomeTab";
import { getShortcutsTab } from "../../Keybinding/Shortcuts";
import useTabStack from "./useTabStack";

const useTabLayout = (props, dockRef) => {
  const { emit, call, on, off } = props;
  const workspaceManager = useMemo(() => new Workspace(), []);
  const activeTabId = useRef(null);
  const firstLoad = useRef(true);
  const tabsById = useRef(new Map());
  const [layout, setLayout] = useState({ ...DEFAULT_LAYOUT });
  const { addTabToStack, removeTabFromStack, getNextTabFromStack } =
    useTabStack(workspaceManager);

  //========================================================================================
  /*                                                                                      *
   *                                    Private Methods                                   *
   *                                                                                      */
  //========================================================================================

  const openNonEditorTabs = useCallback(
    lastTabs => {
      // Save current active tab id
      const currentActiveTabId = activeTabId.current;

      // Open Home Tab
      if (lastTabs.has(HOMETAB_PROFILE.name)) {
        const tabData = getHomeTab();
        tabsById.current.set(tabData.id, tabData);
        workspaceManager.setTabs(tabsById.current);
        dockRef.current.updateTab(HOMETAB_PROFILE.name, tabData, false);
      }

      // Open Shortcuts Tab
      if (lastTabs.has(SHORTCUTS_PROFILE.name)) {
        const tabData = getShortcutsTab();
        tabsById.current.set(tabData.id, tabData);
        workspaceManager.setTabs(tabsById.current);
        dockRef.current.updateTab(SHORTCUTS_PROFILE.name, tabData, false);
      }

      // Set current active tab id after extra tabs update
      activeTabId.current = currentActiveTabId;
      emit(PLUGINS.TABS.ON.ACTIVE_TAB_CHANGE, { id: currentActiveTabId });
    },
    [dockRef, workspaceManager, emit]
  );

  /**
   * Helper function to find if a tab exists in the DockLayout
   * @private function
   * @returns {TabData}: TabData if found
   */
  const findTab = useCallback(
    tabId => {
      return dockRef.current.find(tabId);
    },
    [dockRef]
  );

  /**
   * Focus on a tab by a given tabId
   * - Will check if there's maximized tabs to properly focus the current tab
   * @private function
   * @param {string} tabId : The tab id to be focused
   */
  const focusExistingTab = useCallback(
    tabId => {
      const maxboxChildren = dockRef.current.state.layout.maxbox.children;
      dockRef.current.updateTab(tabId, null);

      if (
        maxboxChildren.length &&
        !maxboxChildren[0].tabs.find(t => t.id === tabId)
      ) {
        dockRef.current.dockMove(maxboxChildren[0], null, DOCK_MODES.MAXIMIZE);
      }
    },
    [dockRef]
  );

  /**
   * Gets a dock name where a tab is
   * @private function
   * @param {String} tabId : the tab id to search for
   * @returns {String} dock name
   */
  const getDockFromTabId = useCallback(
    tabId => {
      const dockLayout = dockRef.current.state.layout;
      const tabData = findTab(tabId);
      const panelId = tabData?.parent?.parent?.id;

      const index =
        Object.values(dockLayout).findIndex(v => v.id === panelId) ?? 0;
      return Object.keys(dockLayout)[index];
    },
    [dockRef, findTab]
  );

  /**
   * Checks if the layout activeId is valid, if not will set the last tab from stack
   * @private function
   * @param {Object} _layout : The layout to search through
   */
  const layoutActiveIdIsValid = useCallback(
    _layout => {
      // let's check if the lastTabId was in maxbox. If it isn't it's most likely in the dockbox.
      const maxboxChildren = _layout.maxbox.children[0];
      const layoutActiveId =
        maxboxChildren?.activeId || _layout.dockbox.children[0]?.activeId;
      let tabExists = maxboxChildren?.tabs.find(t => t.id === layoutActiveId);

      if (!tabExists) {
        tabExists = _layout.dockbox.children[0].tabs.find(
          t => t.id === layoutActiveId
        );
      }

      activeTabId.current = layoutActiveId;

      if (!tabExists && layoutActiveId) {
        const newActiveTabId = getNextTabFromStack();
        if (maxboxChildren) maxboxChildren.activeId = newActiveTabId;
        else _layout.dockbox.children[0].activeId = newActiveTabId;
        activeTabId.current = newActiveTabId;
      }
    },
    [getNextTabFromStack]
  );

  /**
   * Apply layout and save changes
   * @param {LayoutData} layout
   */
  const applyLayout = useCallback(
    _layout => {
      layoutActiveIdIsValid(_layout);
      setLayout(_layout);
      workspaceManager.setLayout(_layout);
    },
    [workspaceManager, layoutActiveIdIsValid]
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
        tabData.id = `${tabData.id.substring(0, tabData.id.lastIndexOf("/"))}/${
          tabData.name
        }`;
        const tabIndex = box.tabs.findIndex(_el => _el.id === prevTabId);
        box.tabs[tabIndex] = tabData;
        box.activeId = tabData.id;
        tabsById.current.delete(prevTabId);
        tabsById.current.set(tabData.id, tabData);
        addTabToStack(tabData, location);
        workspaceManager.setTabs(tabsById.current);
        workspaceManager.setLayout(newLayout);
      }
      return { newLayout, box };
    },
    [_getTabContainer, workspaceManager, addTabToStack]
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
      const { id, name, scope } = docData;
      call(
        PLUGINS.DOC_MANAGER.NAME,
        PLUGINS.DOC_MANAGER.CALL.SAVE,
        {
          name,
          scope
        },
        res => {
          if (res.success) {
            const dock = getDockFromTabId(id);
            removeTabFromStack(id, dock);
            if (newLayout) applyLayout(newLayout);
          }
        }
      );
    },
    [call, applyLayout, getDockFromTabId, removeTabFromStack]
  );

  /**
   * Discard changes and apply layout
   * @param {{name: string, scope: string}} docData
   * @param {LayoutData} newLayout : New layout to apply (optional)
   */
  const _discardChanges = useCallback(
    (docData, newLayout) => {
      const { id, name, scope } = docData;
      call(
        PLUGINS.DOC_MANAGER.NAME,
        PLUGINS.DOC_MANAGER.CALL.DISCARD_DOC_CHANGES,
        { name, scope }
      ).then(() => {
        const dock = getDockFromTabId(id);
        removeTabFromStack(id, dock);
        if (newLayout) applyLayout(newLayout);
      });
    },
    [call, applyLayout, getDockFromTabId, removeTabFromStack]
  );

  /**
   * Open dialog before closing tab in dirty state
   * @param {string} name : Document name
   * @param {string} scope : Document scope
   * @param {LayoutData} newLayout : New layout
   */
  const _closeDirtyTab = useCallback(
    (document, newLayout) => {
      const { name, scope } = document;

      call(PLUGINS.DIALOG.NAME, PLUGINS.DIALOG.CALL.CLOSE_DIRTY_DOC, {
        name,
        scope,
        onSubmit: action => {
          const triggerAction = {
            // Save changes and close document
            save: () => _saveDoc(document, newLayout),
            // Discard changes and close document
            dontSave: () => _discardChanges(document, newLayout)
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
   * @param {boolean} forceClose : Force tab to close
   */
  const _onLayoutRemoveTab = useCallback(
    (newLayout, tabId, forceClose) => {
      const { name, scope, isNew, isDirty } = tabsById.current.get(tabId);
      if (isDirty && !forceClose) {
        const document = { id: tabId, name, scope, isNew };
        _closeDirtyTab(document, newLayout);
      } else {
        // Remove doc locally if is new and not dirty
        if (isNew && !isDirty)
          call(
            PLUGINS.DOC_MANAGER.NAME,
            PLUGINS.DOC_MANAGER.CALL.DISCARD_DOC_CHANGES,
            { name, scope }
          );

        // Remove tab and apply new layout
        tabsById.current.delete(tabId);
        workspaceManager.setTabs(tabsById.current);
        const dock = getDockFromTabId(tabId);
        removeTabFromStack(tabId, dock);
        applyLayout(newLayout);
        // Reset bookmarks
        call(
          PLUGINS.RIGHT_DRAWER.NAME,
          PLUGINS.RIGHT_DRAWER.CALL.RESET_BOOKMARKS
        );
      }
    },
    [
      call,
      workspaceManager,
      applyLayout,
      _closeDirtyTab,
      getDockFromTabId,
      removeTabFromStack
    ]
  );

  /**
   * Close tab : Remove from layout
   * @param {string} tabId : Tab ID (document URL)
   * @param {boolean} forceClose : Force document to close
   * @returns {LayoutData} : Layout without tab
   */
  const _closeTab = useCallback(
    async (tabId, forceClose) => {
      const tabData = findTab(tabId);
      if (!tabData) return;
      const currentLayout = dockRef.current.saveLayout();
      const locations = Object.values(DOCK_POSITIONS);
      // look for tab in layout locations
      for (const location of locations) {
        const box = _getTabContainer(currentLayout[location], tabId);

        if (box) {
          // If it's in a maximized tab, let's minimize it and then call _closeTab again
          if (location === DOCK_POSITIONS.MAX && box.tabs.length === 1) {
            const maxboxMainTab =
              dockRef.current.state.layout.maxbox.children[0];
            await dockRef.current.dockMove(
              maxboxMainTab,
              null,
              DOCK_MODES.MAXIMIZE
            );
            return _closeTab(tabId);
          }

          // Let's remove the tab
          box.tabs = box.tabs.filter(_el => _el.id !== tabId);

          // And update the Layout
          return _onLayoutRemoveTab(currentLayout, tabId, forceClose);
        }
      }
    },
    [dockRef, _getTabContainer, _onLayoutRemoveTab, findTab]
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
      const currentDirtyState = Boolean(currentTabData?.isDirty);
      // Doesn't trigger update if dirty state didn't change
      if (!currentTabData || currentDirtyState === isDirty) return;
      // Set new dirty state
      const newTabData = { ...currentTabData, isDirty: isDirty };
      tabsById.current.set(tabId, newTabData);
      // Trigger tab update
      if (!dockRef.current) return;
      const currentTab = findTab(tabId);
      dockRef.current.updateTab(tabId, currentTab, false);
    },
    [dockRef, findTab]
  );

  /**
   * Install tab plugin
   * @param {*} docFactory : Document Factory
   * @param {{id: string, name: string, scope: string}} docData : Document data
   * @returns {Promise} Promise resolved on installation
   */
  const installTabPlugin = useCallback(async (docFactory, docData) => {
    // If Plugin is already installed, doesn't install it again
    const plugin = PluginManagerIDE.getPlugin(docData.id);
    if (plugin) return Promise.resolve(plugin);
    else {
      const Plugin = docFactory.plugin;
      const viewPlugin = new Plugin(
        { name: docData.id },
        { id: docData.id, name: docData.name, scope: docData.scope }
      );
      return PluginManagerIDE.install(docData.id, viewPlugin).then(
        () => viewPlugin
      );
    }
  }, []);

  /**
   * Get tab data based in document data
   * @param {{id: String, title: String, name: String, scope: String}} docData : document basic data
   * @returns {TabData} Tab data to be set in Layout
   */
  const _getTabData = useCallback(
    docData => {
      return call(
        PLUGINS.DOC_MANAGER.NAME,
        PLUGINS.DOC_MANAGER.CALL.GET_DOC_FACTORY,
        docData.scope
      ).then(docFactory => {
        if (!docFactory) return docData;

        return installTabPlugin(docFactory, docData)
          .then(viewPlugin => {
            // Create and return tab data
            const extension = docFactory.store.model.EXTENSION ?? "";
            // Return TabData
            return {
              id: docData.id,
              name: docData.name,
              isNew: docData.isNew,
              isDirty: docData.isDirty,
              title: _getCustomTab(docData, _closeTab, docData.isDirty),
              extension: extension,
              scope: docData.scope,
              content: viewPlugin.render()
            };
          })
          .catch(err => {
            console.warn("debug can't open tab", err);
            return docData;
          });
      });
    },
    [call, _getCustomTab, _closeTab, installTabPlugin]
  );

  /**
   * Returns the default Tab position
   * @private function
   * @returns {Enumerable} DOCK_POSITIONS: based on if the maxbox has children
   */
  const getDefaultTabPosition = useCallback(() => {
    const maximizedTabs = dockRef.current.state.layout.maxbox.children;
    if (maximizedTabs.length) return DOCK_POSITIONS.MAX;

    return DOCK_POSITIONS.DOCK;
  }, [dockRef]);

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
      const tabPosition = tabData.dockPosition ?? getDefaultTabPosition();
      const position = tabData.position ?? {
        h: 500,
        w: 600,
        x: 145,
        y: 100,
        z: 1
      };

      emit(PLUGINS.TABS.ON.ACTIVE_TAB_CHANGE, { id: tabData.id });
      addTabToStack(tabData, tabPosition);
      tabsById.current.set(tabData.id, tabData);
      workspaceManager.setTabs(tabsById.current);

      const existingTab = findTab(tabData.id);
      if (existingTab) {
        focusExistingTab(tabData.id);
        return;
      }

      // Update new open tab id
      activeTabId.current = tabData.id;
      // Set new layout
      setLayout(prevState => {
        const newState = { ...prevState };
        if (newState[tabPosition].children.length === 0) {
          newState[tabPosition].children = [{ ...position, tabs: [tabData] }];

          workspaceManager.setLayout(newState);
          return { ...newState };
        }

        if (tabPosition === DOCK_POSITIONS.FLOAT) {
          newState[tabPosition].children.push({
            ...position,
            tabs: [tabData]
          });
        } else {
          const firstContainer = _getFirstContainer(newState[tabPosition]);
          firstContainer.tabs.push(tabData);
          firstContainer.activeId = tabData.id;
        }

        workspaceManager.setLayout(newState);
        return { ...newState };
      });
    },
    [
      workspaceManager,
      _getFirstContainer,
      getDefaultTabPosition,
      focusExistingTab,
      addTabToStack,
      findTab,
      emit
    ]
  );

  /**
   * Open Editor tab from document data
   * @param {{id: String, title: String, name: String, scope: String}} docData : document basic data
   */
  const openEditor = useCallback(
    async docData => {
      try {
        const doc = await call(
          PLUGINS.DOC_MANAGER.NAME,
          PLUGINS.DOC_MANAGER.CALL.READ,
          { name: docData.name, scope: docData.scope }
        );

        docData.isNew = docData.isNew ?? doc.isNew;
        docData.isDirty = docData.isDirty ?? doc.isDirty;

        _getTabData(docData).then(tabData => {
          emit(PLUGINS.TABS.ON.OPEN_EDITOR, tabData);
          open(tabData);
        });
      } catch (e) {
        console.warn(e);
      }
    },
    [call, emit, _getTabData, open]
  );

  /**
   * Close Tab
   */
  const close = useCallback(
    data => {
      const { tabId, keepBookmarks } = data;
      // Close tab dynamically
      _closeTab(tabId);
      !keepBookmarks &&
        call(
          PLUGINS.RIGHT_DRAWER.NAME,
          PLUGINS.RIGHT_DRAWER.CALL.RESET_BOOKMARKS
        );
    },
    [call, _closeTab]
  );

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
      const dock = getDockFromTabId(tabId);
      const tabData = tabsById.current.get(tabId);
      let newActiveTabId = tabId;

      // Attempt to close tab
      if (direction === DOCK_MODES.REMOVE) {
        _closeTab(tabId);
        if (!tabData.isDirty) {
          newActiveTabId =
            getNextTabFromStack(dock) ||
            _getFirstContainer(newLayout.dockbox).activeId;
        }
      } else {
        // Update layout
        applyLayout(newLayout);

        !firstLoad.current && addTabToStack(tabData, dock);
        firstLoad.current = false;
      }
      // Emit new active tab id
      if (!tabId) return;
      if (newActiveTabId) {
        activeTabId.current = newActiveTabId;
        emit(PLUGINS.TABS.ON.ACTIVE_TAB_CHANGE, { id: newActiveTabId });
      } else {
        call(
          PLUGINS.RIGHT_DRAWER.NAME,
          PLUGINS.RIGHT_DRAWER.CALL.RESET_BOOKMARKS
        );
      }
    },
    [
      emit,
      call,
      _getFirstContainer,
      _closeTab,
      applyLayout,
      getDockFromTabId,
      addTabToStack,
      getNextTabFromStack
    ]
  );

  /**
   * Update tab ID and data
   * @param {String} prevTabId : Old tab ID
   * @param {{id: String, name: String, scope: String}} docData : document basic data
   */
  const updateTabId = useCallback(
    (prevTabId, newTabData) => {
      _getTabData(newTabData).then(tabData => {
        // Update new open tab id
        activeTabId.current = tabData.id;
        // Set new layout
        setLayout(prevState => {
          // look for tab in windowbox
          const locations = Object.values(DOCK_POSITIONS);
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

  /**
   * Get currently active tab
   * @returns {string} active tab id
   */
  const getActiveTab = useCallback(() => {
    return tabsById.current.get(activeTabId.current);
  }, []);

  /**
   * Focus on active tab
   */
  const focusActiveTab = useCallback(() => {
    focusExistingTab(activeTabId.current);
  }, [focusExistingTab]);

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
    on(
      PLUGINS.DOC_MANAGER.NAME,
      PLUGINS.DOC_MANAGER.ON.UPDATE_DOC_DIRTY,
      data => _updateDocDirty(data)
    );
    // On delete document
    on(PLUGINS.DOC_MANAGER.NAME, PLUGINS.DOC_MANAGER.ON.DELETE_DOC, data =>
      _closeTab(data.url, true)
    );

    // We want to reload the tabData if it was a new tab
    on(PLUGINS.DOC_MANAGER.NAME, PLUGINS.DOC_MANAGER.ON.SAVE_DOC, data => {
      if (data.newName) {
        const doc = data.doc;
        const scope = doc.type;
        const name = data.newName;
        const newTabData = {
          id: buildDocPath({
            workspace: doc.workspace,
            scope,
            name
          }),
          name,
          scope
        };

        updateTabId(doc.path.replace(`/${doc.version}`, ""), newTabData);

        call(PLUGINS.DOC_MANAGER.NAME, PLUGINS.DOC_MANAGER.CALL.RELOAD_DOC, {
          scope,
          name
        });
      }
    });
    // Unsubscribe on unmount
    return () => {
      off(PLUGINS.DOC_MANAGER.NAME, PLUGINS.DOC_MANAGER.ON.UPDATE_DOC_DIRTY);
      off(PLUGINS.DOC_MANAGER.NAME, PLUGINS.DOC_MANAGER.ON.DELETE_DOC);
      off(PLUGINS.DOC_MANAGER.NAME, PLUGINS.DOC_MANAGER.ON.SAVE_DOC);
    };
  }, [on, call, off, _updateDocDirty, updateTabId, _closeTab]);

  /**
   * Load workspace
   */
  useEffect(() => {
    const [lastLayout, lastTabs] = workspaceManager.getLayoutAndTabs();
    const tabs = [];

    layoutActiveIdIsValid(lastLayout);

    tabsById.current = lastTabs;
    // Install current tabs plugins
    lastTabs.forEach(tab => {
      const { id, name, scope } = tab;

      tabs.push(_getTabData({ id, name, scope }));
    });
    // After all plugins are installed
    Promise.allSettled(tabs).then(_tabs => {
      _tabs.forEach(tab => {
        tab.status === "fulfilled" &&
          tabsById.current.set(tab.value.id, tab.value);
      });
      setLayout(lastLayout);

      openNonEditorTabs(lastTabs);
    });

    // Destroy local workspace manager instance on unmount
    return () => {
      workspaceManager.destroy();
    };
  }, [
    dockRef,
    workspaceManager,
    _getTabData,
    layoutActiveIdIsValid,
    openNonEditorTabs
  ]);

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
    focusExistingTab,
    getActiveTab,
    focusActiveTab,
    updateTabId
  };
};

export default useTabLayout;
