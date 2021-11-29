import ConfigurationStore from "../../store/Configuration/ConfigurationStore";
import Configuration from "../views/editors/Configuration/Configuration";

/**
 *
 * @param {string} workspace The workspace where to load the documents from
 * @returns {Array} A list of store instances
 */
const builder = workspace => {
  return {
    [ConfigurationStore.SCOPE]: {
      store: new ConfigurationStore(workspace),
      plugin: Configuration
    }
  };
  // return [
  // {
  //   name: "Callback",
  //   title: "Callbacks",
  //   scope: "Callback",
  //   store: new CallbackStore({ workspace }),
  //   plugin: {},
  //   docs: {}
  // },
  // {
  //   name: "Configuration",
  //   title: "Configurations",
  //   scope: "Configuration",
  //   store: new ConfigurationStore(workspace),
  //   plugin: Configuration,
  //   docs: {}
  // }
  // {
  //   name: "Flow",
  //   title: "Flows",
  //   scope: "Flow",
  //   store: new FlowStore({ workspace }),
  //   plugin: {},
  //   docs: {}
  // },
  // {
  //   name: "Node",
  //   title: "Nodes",
  //   scope: "Node",
  //   store: new NodeStore({ workspace }),
  //   plugin: {},
  //   docs: {}
  // }
  // ];
};

export default builder;
