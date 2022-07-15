import { Store, DBSubscriber } from "../../../store";
import Model from "../model/Flow";
import Helper from "./Helper";

class FlowStore extends Store {
  constructor(workspace, observer, docManager) {
    super({
      workspace,
      model: Model,
      name: Model.SCOPE,
      title: "Flows",
      plugins: [DBSubscriber],
      docManager,
      observer
    });
  }

  // Set helper object with cloudFunction
  helper = Helper;

  loadDoc(name) {
    this.getPlugin("DBSubscriber").subscribe(name);

    return super.loadDoc(name);
  }

  static SCOPE = Model.SCOPE;
}

export default FlowStore;
