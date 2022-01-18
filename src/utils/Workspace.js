import { Authentication } from "@mov-ai/mov-fe-lib-core";
import LocalStorage from "./LocalStorage";

class Workspace {
  constructor() {
    if (instance) return instance;
    instance = this;

    const APP_NAME = "movai-ide-ce";
    const USER_NAME = Authentication.getTokenData().message.name ?? "";
    
    this.storage = new LocalStorage();
    this.TABS_KEY = `movai.${USER_NAME}.${APP_NAME}.tabs`;
    this.LAYOUT_KEY = `movai.${USER_NAME}.${APP_NAME}.layout`;
    this.SELECTED_ROBOT_KEY = `movai.${USER_NAME}.${APP_NAME}.selectedRobot`;
    this.RECENT_DOCUMENTS_KEY = `movai.${USER_NAME}.${APP_NAME}.recentDocuments`;
    this.layout = this.getLayout();
    this.tabs = this.getTabs();
    this.recentDocuments = this.getRecentDocuments();
    this.selectedRobot = this.getSelectedRobot();
    this.defaultRecentDocuments = [];
  }

  destroy() {
    instance = null;
  }

  //========================================================================================
  /*                                                                                      *
   *                                         Tabs                                         *
   *                                                                                      */
  //========================================================================================

  /**
   * Set tabs Layout in local storage
   * @param {LayoutData} layout : RC-Dock layout data
   */
  setLayout(layout) {
    this.storage.set(this.LAYOUT_KEY, layout);
    this.layout = layout;
  }

  /**
   * Get tabs layout from local storage
   * @param {LayoutData} defaultLayout : Default Layout data to be returned in case there's nothing in local storage
   * @returns {LayoutData} Layout from local storage or defaultLayout value
   */
  getLayout(defaultLayout) {
    return this.storage.get(this.LAYOUT_KEY) ?? defaultLayout;
  }

  /**
   * Set open tabs info in local storage
   * @param {Map<TabData>} tabs Map of tab data currently open
   */
  setTabs(tabs) {
    const tabsObj = Object.fromEntries(tabs);
    this.storage.set(this.TABS_KEY, tabsObj);
    this.tabs = tabs;
  }

  /**
   * Get information about current open tab from local storage
   * @returns {Map<TabData>}
   */
  getTabs() {
    const storedTabs = this.storage.get(this.TABS_KEY) ?? {};
    return new Map(Object.entries(storedTabs));
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
   * @param {*} layout 
   */
  setRecentDocuments(layout) {
    this.storage.set(this.RECENT_DOCUMENTS_KEY, layout);
    this.recentDocuments = layout;
  }

  /**
   * Gets the Recent Documents 
   * @param {*} defaultLayout 
   * @returns 
   */
  getRecentDocuments(defaultLayout = this.defaultRecentDocuments) {
    return this.storage.get(this.RECENT_DOCUMENTS_KEY) ?? defaultLayout;
  }

}

let instance = null;

export default Workspace;
