import Model from "../../models/Node/Node";
import DBSubscriber from "../DBSubscriber";
import Helper from "./Helper";
import Store from "../Store";

class NodeStore extends Store {
  constructor(workspace, observer, docManager) {
    super({
      workspace,
      model: Model,
      name: "Node",
      title: "Nodes",
      plugins: [DBSubscriber],
      docManager,
      observer
    });
  }

  // Set helper object with cloudFunction and more
  helper = Helper;

  /**
   * @override loadDoc to activate Redis subscriber to document
   * @param {string} name : Document name
   * @returns Parent loadDoc method
   */
  loadDoc(name) {
    this.getPlugin("DBSubscriber").subscribe(name);

    return super.loadDoc(name);
  }

  /**
   * @override destroy method to unsubscribe to data in helper
   */
  destroy() {
    super.destroy();
    this.helper.destroy();
  }

  static SCOPE = Model.SCOPE;
}

export default NodeStore;
