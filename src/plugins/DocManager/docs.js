import CallbackStore from "../../store/Callback/CallbackStore";
import ConfigurationStore from "../../store/Configuration/ConfigurationStore";
import Configuration from "../views/editors/Configuration/Configuration";

/**
 * Returns a list of interfaces
 * @param {string} workspace : The workspace where to load the documents from
 * @returns {Array<{store: Store, plugin: ViewPlugin}>}
 */

const factory = (workspace, observer) => {
  return {
    [CallbackStore.SCOPE]: {
      store: new CallbackStore(workspace, observer),
      plugin: Configuration
    },
    [ConfigurationStore.SCOPE]: {
      store: new ConfigurationStore(workspace, observer),
      plugin: Configuration
    }
  };
};

export default factory;
