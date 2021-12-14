import ConfigurationStore from "../../store/Configuration/ConfigurationStore";
import Configuration from "../views/editors/Configuration/Configuration";
import FlowStore from "../../store/Flow/FlowStore";
import FlowPlugin from "../views/editors/Flow/FlowPlugin";

/**
 * Returns a list of interfaces
 * @param {string} workspace : The workspace where to load the documents from
 * @returns {Array<{store: Store, plugin: ViewPlugin}>}
 */

const factory = (workspace, observer) => {
  return {
    // [CallbackStore.SCOPE]: {
    //   store: new CallbackStore(workspace, observer),
    //   plugin: Configuration
    // },
    [ConfigurationStore.SCOPE]: {
      store: new ConfigurationStore(workspace, observer),
      plugin: Configuration
    },
    [FlowStore.SCOPE]: {
      store: new FlowStore(workspace, observer),
      plugin: FlowPlugin
    }
  };
};

export default factory;
