import { Plugin } from "@remixproject/engine";
import PluginManagerIDE from "../PluginManagerIDE/PluginManagerIDE";
export default class IDEPlugin extends Plugin {
  onTopic = (topicName, lambda = x => {}) => {
    const pluginManager = PluginManagerIDE.getInstance();
    pluginManager.addTopic(topicName, this, lambda);
  };
}
