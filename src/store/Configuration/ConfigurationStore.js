import Model from "../../models/Configuration/Configuration";
import Store from "../Store";

class ConfigurationStore extends Store {
  constructor(workspace, observer) {
    super({
      workspace,
      model: Model,
      name: "Configuration",
      title: "Configurations",
      observer
    });
  }

  static SCOPE = Model.SCOPE;
}

export default ConfigurationStore;
