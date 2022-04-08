import React from "react";
import { DOCK_POSITIONS } from "../../../../utils/Constants";

const useTabStack = workspaceManager => {
  const tabStack = React.useRef({});
  //========================================================================================
  /*                                                                                      *
   *                                    Private Methods                                   *
   *                                                                                      */
  //========================================================================================

  /**
   * Removes a tab from the stack for given dock
   * @private function
   * @param {String} dock : the dock to look for the tab, defaults to 'dockbox'
   * @param {String} tabId : the tabId to remove from the stack
   */
  const removeTabFromStack = React.useCallback(
    (tabId, dock = DOCK_POSITIONS.DOCK) => {
      const thisStack = tabStack.current[dock] || [];
      if (thisStack.includes(tabId)) {
        thisStack.splice(thisStack.indexOf(tabId), 1);
        workspaceManager.setTabStack(tabStack.current);
      }
    },
    [workspaceManager]
  );

  /**
   * Adds a tab to the stack of given dock
   * @private function
   * @param {String} dock : the dock to look for the tab, defaults to 'dockbox'
   * @param {String} tabId : the tabId to add to the stack
   */
  const addTabToStack = React.useCallback(
    (tabId, dock = DOCK_POSITIONS.DOCK) => {
      const thisStack = tabStack.current[dock] || [];

      removeTabFromStack(tabId, dock);

      thisStack.push(tabId);
      workspaceManager.setTabStack(tabStack.current);
    },
    [workspaceManager, removeTabFromStack]
  );

  /**
   * Get next tab from stack
   * @private function
   */
  const getNextTabFromStack = React.useCallback(
    (dock = DOCK_POSITIONS.DOCK) => {
      const thisStack = tabStack.current[dock] || [];
      return thisStack[thisStack.length - 1];
    },
    []
  );

  //========================================================================================
  /*                                                                                      *
   *                                    React Lifecycle                                   *
   *                                                                                      */
  //========================================================================================

  React.useEffect(() => {
    tabStack.current = workspaceManager.getTabStack();
  }, [workspaceManager]);

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
