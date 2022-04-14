import Model from "../../models/Callback/Callback";
import DBSubscriber from "../DBSubscriber";
import Store from "../Store";
import Helper from "./Helper";

class CallbackStore extends Store {
  constructor(workspace, observer) {
    super({
      workspace,
      model: Model,
      name: "Callback",
      title: "Callbacks",
      plugins: [DBSubscriber],
      observer
    });

    // Set protectedDocs list
    this.protectedDocs = [
      "place_holder",
      "backend.CallbackEditor",
      "backend.DataValidation",
      "backend.FlowTopBar",
      "backend.getPortsData"
    ];
  }

  // Set helper object with cloudFunction
  helper = Helper;

  loadDoc(name) {
    this.getPlugin("DBSubscriber").subscribe(name);

    return super.loadDoc(name);
  }

  static SCOPE = Model.SCOPE;
}

export default CallbackStore;
