import { Authentication } from "@mov-ai/mov-fe-lib-core";
import { DEFAULT_LAYOUT, DEFAULT_TABS } from "./Constants";
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
    this.RECENT_DOCUMENTS_KEY = `movai.${USER_NAME}.${APP_NAME}.recentDocuments`;
    this.layoutAndTabs = this.getLayoutAndTabs();
    this.layout = this.layoutAndTabs[0];
    this.tabs = this.layoutAndTabs[1];
    this.recentDocuments = this.getRecentDocuments();
    this.defaultRecentDocuments = [];
  }

  /**
   * Destroys the instance of workspace
   */
  destroy() {
    instance = null;
  }

  /**
   * Sets the Recent Documents
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
    return this.storage.get(this.RECENT_DOCUMENTS_KEY) ?? defaultRecentDocuments;
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
   * Gets layout and tabs for the Layout
   * @returns {Array} with the layout and tabs
   */
  getLayoutAndTabs() {
    const tabs = this.getTabs();

    if(!tabs.size){
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
   * Gets the tabs for the Layout
   * @returns {Map} with the Stored Tabs
   */
  getTabs() {
    const storedTabs = this.storage.get(this.TABS_KEY) ?? {};
    return new Map(Object.entries(storedTabs));
  }
}

let instance = null;

export default Workspace;
