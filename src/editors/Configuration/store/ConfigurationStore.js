import Model from "../model/Configuration";
import { Store, DBSubscriber } from "../../../store";

class ConfigurationStore extends Store {
  constructor(workspace, observer) {
    super({
      workspace,
      model: Model,
      name: Model.SCOPE,
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
