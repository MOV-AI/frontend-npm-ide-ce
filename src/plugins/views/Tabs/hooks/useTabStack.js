import React, { useCallback, useEffect } from "react";
import { DOCK_POSITIONS } from "../../../../utils/Constants";
import { runBeforeUnload } from "../../../../utils/Utils";

const useTabStack = workspaceManager => {
  const tabStack = React.useRef({});

  //========================================================================================
  /*                                                                                      *
   *                                    Private Methods                                   *
   *                                                                                      */
  //========================================================================================

  /**
   * @private Remove all untitled tabs (not created in Redis)
   */
  const removeNewTabsFromStack = useCallback(() => {
    const thisStack = tabStack.current;
    const newStack = {};
    for (const dock in thisStack) {
      const dockStack = thisStack[dock];
      newStack[dock] = dockStack.filter(tab => !tab.isNew);
    }
    workspaceManager.setTabStack(newStack);
  }, [workspaceManager]);

  //========================================================================================
  /*                                                                                      *
   *                                    Public Methods                                    *
   *                                                                                      */
  //========================================================================================

  /**
   * Removes a tab from the stack for given dock
   * @param {String} dock : the dock to look for the tab, defaults to 'dockbox'
   * @param {String} tabId : the tabId to remove from the stack
   */
  const removeTabFromStack = useCallback(
    (tabId, dock = DOCK_POSITIONS.DOCK) => {
      const thisStack = tabStack.current[dock] || [];
      const newStack = thisStack.filter(tab => tab.id !== tabId);
      tabStack.current[dock] = newStack;
      workspaceManager.setTabStack(tabStack.current);
    },
    [workspaceManager]
  );

  /**
   * Adds a tab to the stack of given dock
   * @param {String} dock : the dock to look for the tab, defaults to 'dockbox'
   * @param {String} tabId : the tabId to add to the stack
   */
  const addTabToStack = useCallback(
    (tabData, dock = DOCK_POSITIONS.DOCK) => {
      const { id, isNew } = tabData;
      removeTabFromStack(id, dock);
      const thisStack = tabStack.current[dock] || [];

      thisStack.push({ id, isNew });
      tabStack.current[dock] = thisStack;
      workspaceManager.setTabStack(tabStack.current);
    },
    [workspaceManager, removeTabFromStack]
  );

  /**
   * Get next tab from stack
   */
  const getNextTabFromStack = useCallback((dock = DOCK_POSITIONS.DOCK) => {
    const thisStack = tabStack.current[dock] || [];
    return thisStack[thisStack.length - 1]?.id;
  }, []);

  //========================================================================================
  /*                                                                                      *
   *                                    React Lifecycle                                   *
   *                                                                                      */
  //========================================================================================

  useEffect(() => {
    tabStack.current = workspaceManager.getTabStack();
    // Before unload app, remove all "untitled" tabs from stack
    runBeforeUnload(removeNewTabsFromStack);
  }, [workspaceManager, removeNewTabsFromStack]);

  //========================================================================================
  /*                                                                                      *
   *                             Return Exposed Methods                                   *
   *                                                                                      */
  //========================================================================================

  return {
    addTabToStack,
    removeTabFromStack,
    getNextTabFromStack
  };
};

export default useTabStack;
