import Model from "../../models/Node/Node";
import DBSubscriber from "../DBSubscriber";
import Helper from "./NodeHelper";
import Store from "../Store";

class NodeStore extends Store {
  constructor(workspace, observer) {
    super({
      workspace,
      model: Model,
      name: "Node",
      title: "Nodes",
      plugins: [DBSubscriber],
      observer
    });
  }

  // Set helper object with cloudFunction and more
  helper = Helper;

  loadDoc(name) {
    this.getPlugin("DBSubscriber").subscribe(name);

    return super.loadDoc(name);
  }

  static SCOPE = Model.SCOPE;
}

export default NodeStore;
