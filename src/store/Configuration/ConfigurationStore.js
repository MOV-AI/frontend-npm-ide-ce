import Model from "../../models/Configuration/Configuration";
import Store from "../Store";

class ConfigurationStore extends Store {
  constructor(workspace) {
    super({
      workspace,
      model: Model,
      name: "Configuration",
      title: "Configurations"
    });
  }

  static SCOPE = "Configuration";
}

export default ConfigurationStore;
