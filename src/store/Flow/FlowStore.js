import Model from "../../models/Flow/Flow";
import DBSubscriber from "../DBSubscriber";
import Store from "../Store";
import Helper from "./Helper";

class FlowStore extends Store {
  constructor(workspace, observer, docManager) {
    super({
      workspace,
      model: Model,
      name: "Flow",
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
