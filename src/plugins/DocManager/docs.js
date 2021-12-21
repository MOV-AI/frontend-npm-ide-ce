import {
  CallbackStore,
  ConfigurationStore,
  FlowStore,
  NodeStore
} from "../../store";
import Configuration from "../views/editors/Configuration/Configuration";
import Callback from "../views/editors/Callback/Callback";
import Node from "../views/editors/Node/Node";

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
    },
    [NodeStore.SCOPE]: {
      store: new NodeStore(workspace, observer),
      plugin: Node
    },
    [FlowStore.SCOPE]: {
      store: new FlowStore(workspace, observer),
      plugin: Node
    }
  };
};

export default factory;
