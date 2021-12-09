import { Authentication } from "@mov-ai/mov-fe-lib-core";
import LocalStorage from "./LocalStorage";

class Workspace {
  constructor() {
    if (instance) return instance;
    instance = this;
    this.storage = new LocalStorage();
    const userName = Authentication.getTokenData().message.name ?? "";
    const APP_NAME = "movai-ide-ce";
    this.TABS_KEY = `movai.${userName}.${APP_NAME}.tabs`;
    this.LAYOUT_KEY = `movai.${userName}.${APP_NAME}.layout`;
    this.layout = this.getLayout();
    this.tabs = this.getTabs();
  }

  destroy() {
    instance = null;
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
