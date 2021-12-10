import Model from "../../models/Configuration/Configuration";
import Configuration from "../../plugins/views/editors/Configuration/Configuration";
import DBSubscriber from "../DBSubscriber";
import Store from "../Store";

class ConfigurationStore extends Store {
  constructor(workspace, observer) {
    super({
      workspace,
      model: Model,
      plugin: Configuration, // TODO: remove
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
