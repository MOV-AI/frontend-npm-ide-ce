import { Store, DBSubscriber } from "../../../store";
import Model from "../model/Callback";
import Helper from "./Helper";

class CallbackStore extends Store {
  constructor(workspace, observer) {
    super({
      workspace,
      model: Model,
      name: Model.SCOPE,
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
