import {
  CallbackStore,
  ConfigurationStore,
  FlowStore,
  NodeStore
} from "../../store";
import { Callback, Configuration, Flow, Node } from "../views/editors";

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
      plugin: Flow
    }
  };
};

export default factory;
