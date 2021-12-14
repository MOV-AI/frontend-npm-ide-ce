import Model from "../../models/Flow/Flow";
import DBSubscriber from "../DBSubscriber";
import Store from "../Store";

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

  loadDoc(name) {
    this.getPlugin("DBSubscriber").subscribe(name);

    return super.loadDoc(name);
  }

  static SCOPE = Model.SCOPE;
}

export default FlowStore;
