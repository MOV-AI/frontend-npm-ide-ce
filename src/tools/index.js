import { getTabData } from "./NotInstalled/NotInstalled";

const APP_TOOLS = {};

export const addTool = (name, tool) => {
  APP_TOOLS[name] = tool;
};

export const getToolTabData = tab => {
  const { id, name } = tab;
  const data = id in APP_TOOLS ? APP_TOOLS[id].tabData : getTabData(id, name);
  // Sanitize tab data to avoid TypeError: Converting circular structure to JSON
  if ("parent" in data) delete data.parent;
  return data;
};

export const hasTool = name => {
  return name in APP_TOOLS;
};

export const getMainMenuTools = () => {
  return Object.values(APP_TOOLS).filter(tool => tool.mainMenu);
};

export const getSystemBarTools = () => {
  return Object.values(APP_TOOLS).filter(tool => tool.toolBar);
};

export const getQuickAccessTools = () => {
  return Object.values(APP_TOOLS).filter(tool => tool.quickAccess);
};
