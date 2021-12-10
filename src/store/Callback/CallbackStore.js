import Model from "../../models/Callback/Callback";
import Store from "../Store";

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

  static SCOPE = Model.SCOPE;
}

export default CallbackStore;
