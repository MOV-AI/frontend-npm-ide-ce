import { Plugin } from "@remixproject/engine";
import PluginManagerIDE from "../PluginManagerIDE/PluginManagerIDE";

export default class IDEPlugin extends Plugin {
  onTopic = (topicName, lambda = x => {}) => {
    const profiles = PluginManagerIDE.getInstance().manager.getProfiles();
    profiles.forEach(profile => {
      this.on(profile.name, topicName, lambda);
    });
  };
}
