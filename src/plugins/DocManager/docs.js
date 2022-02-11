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

const factory = (workspace, observer, docManager) => {
  return {
    [CallbackStore.SCOPE]: {
      store: new CallbackStore(workspace, observer, docManager),
      plugin: Callback
    },
    [ConfigurationStore.SCOPE]: {
      store: new ConfigurationStore(workspace, observer, docManager),
      plugin: Configuration
    },
    [NodeStore.SCOPE]: {
      store: new NodeStore(workspace, observer, docManager),
      plugin: Node
    },
    [FlowStore.SCOPE]: {
      store: new FlowStore(workspace, observer, docManager),
      plugin: Flow
    }
  };
};

export default factory;
