import Model from "../../models/Callback/Callback";
import Store from "../Store";
import Helper from "./CallbackHelper";

class CallbackStore extends Store {
  constructor(workspace, observer) {
    super({
      workspace,
      model: Model,
      name: "Callback",
      title: "Callbacks",
      observer
    });
  }

  // Set helper object with cloudFunction
  helper = Helper;

  static SCOPE = Model.SCOPE;
}

export default CallbackStore;
