import Model from "../Model/Model";

export default class Callback extends Model {
  getScope() {
    return Callback.SCOPE;
  }

  static SCOPE = "Callback";

  static ofJSON(json) {
    const { Label: name, LastUpdate: details } = json;
    return new Callback(name, details);
  }

  static EMPTY = new Callback();
}
