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
    this.RECENT_DOCUMENTS_KEY = `movai.${USER_NAME}.${APP_NAME}.recentDocuments`;
    this.layout = this.getLayout();
    this.tabs = this.getTabs();
    this.recentDocuments = this.getRecentDocuments();
    this.defaultRecentDocuments = [];
  }

  destroy() {
    instance = null;
  }

  setRecentDocuments(layout) {
    this.storage.set(this.RECENT_DOCUMENTS_KEY, layout);
    this.recentDocuments = layout;
  }

  getRecentDocuments(defaultLayout = this.defaultRecentDocuments) {
    return this.storage.get(this.RECENT_DOCUMENTS_KEY) ?? defaultLayout;
  }

  setLayout(layout) {
    this.storage.set(this.LAYOUT_KEY, layout);
    this.layout = layout;
  }

  getLayout(defaultLayout) {
    return this.storage.get(this.LAYOUT_KEY) ?? defaultLayout;
  }

  setTabs(tabs) {
    const tabsObj = Object.fromEntries(tabs);
    this.storage.set(this.TABS_KEY, tabsObj);
    this.tabs = tabs;
  }

  getTabs() {
    const storedTabs = this.storage.get(this.TABS_KEY) ?? {};
    return new Map(Object.entries(storedTabs));
  }
}

let instance = null;

export default Workspace;
