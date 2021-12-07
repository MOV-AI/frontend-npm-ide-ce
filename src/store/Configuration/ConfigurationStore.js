import Model from "../../models/Configuration/Configuration";
import Configuration from "../../plugins/views/editors/Configuration/Configuration";
import Store from "../Store";

class ConfigurationStore extends Store {
  constructor(workspace, observer) {
    super({
      workspace,
      model: Model,
      plugin: Configuration, // TODO: remove
      name: "Configuration",
      title: "Configurations",
      observer
    });
  }

  static SCOPE = Model.SCOPE;
}

export default ConfigurationStore;
