import Model from "../../models/Configuration/Configuration";
import DBSubscriber from "../DBSubscriber";
import Store from "../Store";

class ConfigurationStore extends Store {
  constructor(workspace, observer) {
    super({
      workspace,
      model: Model,
      name: "Configuration",
      title: "Configurations",
      plugins: [DBSubscriber],
      observer
    });
  }

  loadDoc(name) {
    this.getPlugin("DBSubscriber").subscribe(name);

    return super.loadDoc(name);
  }

  static SCOPE = Model.SCOPE;
}

export default ConfigurationStore;
