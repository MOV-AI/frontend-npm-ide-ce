import ConfigurationStore from "../../store/Configuration/ConfigurationStore";
import CallbackStore from "../../store/Callback/CallbackStore";
import Configuration from "../views/editors/Configuration/Configuration";
import Callback from "../views/editors/Callback/Callback";

/**
 * Returns a list of interfaces
 * @param {string} workspace : The workspace where to load the documents from
 * @returns {Array<{store: Store, plugin: ViewPlugin}>}
 */

const factory = (workspace, observer) => {
  return {
    [CallbackStore.SCOPE]: {
      store: new CallbackStore(workspace, observer),
      plugin: Callback
    },
    [ConfigurationStore.SCOPE]: {
      store: new ConfigurationStore(workspace, observer),
      plugin: Configuration
    }
  };
};

export default factory;
