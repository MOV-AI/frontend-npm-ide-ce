import { User } from "@mov-ai/mov-fe-lib-core";
import { DOCK_POSITIONS, DEFAULT_LAYOUT, DEFAULT_TABS } from "./Constants";
import LocalStorage from "./LocalStorage";

class Workspace {
  constructor() {
    if (instance) return instance;
    instance = this;
    this.user = new User();

    const APP_NAME = "movai-ide-ce";
    const USER_NAME = this.user.getUsername() ?? "";

    this.storage = new LocalStorage();
    this.TABS_KEY = `movai.${USER_NAME}.${APP_NAME}.tabs`;
    this.TAB_STACK_KEY = `movai.${USER_NAME}.${APP_NAME}.tabStack`;
    this.LAYOUT_KEY = `movai.${USER_NAME}.${APP_NAME}.layout`;
    this.SELECTED_ROBOT_KEY = `movai.${USER_NAME}.${APP_NAME}.selectedRobot`;
    this.RECENT_DOCUMENTS_KEY = `movai.${USER_NAME}.${APP_NAME}.recentDocuments`;
    this.DEBUGGING_FLOW_KEY = `movai.${USER_NAME}.${APP_NAME}.flowIsDebugging`;
    this.layoutAndTabs = this.getLayoutAndTabs();
    this.layout = this.layoutAndTabs[0];
    this.tabs = this.layoutAndTabs[1];
    this.tabStack = this.getTabStack();
    this.defaultTabStack = Object.values(DOCK_POSITIONS).reduce(
      (a, k) => ({ ...a, [k]: [] }),
      {}
    );
    this.recentDocuments = this.getRecentDocuments();
    this.selectedRobot = this.getSelectedRobot();
    this.defaultRecentDocuments = [];
  }

  /**
   * Destroys the instance of workspace
   */
  destroy() {
    instance = null;
  }

  /**
   * Sets the layout
   * @param {Object} layout
   */
  setLayout(layout) {
    this.storage.set(this.LAYOUT_KEY, layout);
    this.layout = layout;
  }

  /**
   * Gets layout, if there are no tabs will return the DEFAULT_LAYOUT
   * @returns {Object} layout
   */
  getLayout() {
    const tabs = this.getStoredTabs();

    if (!tabs.size) {
      return DEFAULT_LAYOUT;
    }

    return this.storage.get(this.LAYOUT_KEY);
  }

  /**
   * Gets layout and tabs for the Layout
   * @returns {Array} with the layout and tabs
   */
  getLayoutAndTabs() {
    const tabs = this.getStoredTabs();

    if (!tabs.size) {
      return [DEFAULT_LAYOUT, DEFAULT_TABS];
    }

    return [this.storage.get(this.LAYOUT_KEY), tabs];
  }

  /**
   * Sets the tabs for the Layout
   * @param {Map} tabs
   */
  setTabs(tabs) {
    const tabsObj = Object.fromEntries(tabs);
    this.storage.set(this.TABS_KEY, tabsObj);
    this.tabs = tabs;
  }

  /**
   * Get information about current tabs
   * @returns {Map<TabData>}
   */
  getTabs() {
    return this.tabs;
  }

  /**
   * Get information about current open tab from local storage
   * @returns {Map<TabData>}
   */
  getStoredTabs() {
    const storedTabs = this.storage.get(this.TABS_KEY) ?? {};
    return new Map(Object.entries(storedTabs));
  }

  /**
   * Sets the tab stack for the Layout
   * @param {Object} tabStack
   */
  setTabStack(tabStack) {
    this.storage.set(this.TAB_STACK_KEY, tabStack);
  }

  /**
   * Get information about current open tab stack from local storage
   * @returns {Object} tabStack
   */
  getTabStack(defaultTabStack = this.defaultTabStack) {
    const tabStack = this.storage.get(this.TAB_STACK_KEY) ?? defaultTabStack;
    // Convert tabStack to new format
    for (const dock in tabStack) {
      tabStack[dock] = tabStack[dock].map(tab => ({
        id: tab.id || tab,
        isNew: tab.isNew
      }));
    }
    // Return formatted tabStack
    return tabStack;
  }

  //========================================================================================
  /*                                                                                      *
   *                               Flow Debug : Used in Flow                              *
   *                                                                                      */
  //========================================================================================

  /**
   * Attempts to get the stored flowDebugging value, false is default
   * @returns {Boolean} : Is the flow debugging?
   */
  getFlowIsDebugging() {
    return this.storage.get(this.DEBUGGING_FLOW_KEY) ?? false;
  }

  /**
   * Attempts to set the stored flowDebugging value, sets false if nothing is passed
   * @param {Boolean} isFlowDebugging : Is the flow debugging?
   */
  setFlowIsDebugging(isFlowDebugging) {
    this.storage.set(this.DEBUGGING_FLOW_KEY, isFlowDebugging ?? false);
  }

  //========================================================================================
  /*                                                                                      *
   *                          Selected Robot : Used in FlowTopBar                         *
   *                                                                                      */
  //========================================================================================

  /**
   * Set selected robot in local storage
   * @param {string} robotId Robot ID
   */
  setSelectedRobot(robotId) {
    this.storage.set(this.SELECTED_ROBOT_KEY, robotId);
    this.selectedRobot = robotId;
  }

  /**
   * Get selected robot ID from local storage
   * @returns {string} Robot ID
   */
  getSelectedRobot() {
    return this.storage.get(this.SELECTED_ROBOT_KEY) ?? "";
  }

  //========================================================================================
  /*                                                                                      *
   *                        Recent Documents : Used in Welcome Tab                        *
   *                                                                                      */
  //========================================================================================

  /**
   * Sets the Recent Documents in the layout
   * @param {Object} recentDocuments
   */
  setRecentDocuments(recentDocuments) {
    this.storage.set(this.RECENT_DOCUMENTS_KEY, recentDocuments);
    this.recentDocuments = recentDocuments;
  }

  /**
   * Gets the Recent Documents or the default if it doesn't exist in the local storage
   * @param {Object} defaultRecentDocuments
   * @returns {Object} with the Recent Documents
   */
  getRecentDocuments(defaultRecentDocuments = this.defaultRecentDocuments) {
    return (
      this.storage.get(this.RECENT_DOCUMENTS_KEY) ?? defaultRecentDocuments
    );
  }
}

let instance = null;

export default Workspace;
