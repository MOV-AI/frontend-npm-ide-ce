import Model from "../../models/Flow/Flow";
import DBSubscriber from "../DBSubscriber";
import Store from "../Store";
import Helper from "./FlowHelper";

class FlowStore extends Store {
  constructor(workspace, observer) {
    super({
      workspace,
      model: Model,
      name: "Flow",
      title: "Flows",
      plugins: [DBSubscriber],
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
