import Model from "../Model/Model";

export default class Flow extends Model {
  getScope() {
    return Flow.SCOPE;
  }

  static SCOPE = "Flow";

  static ofJSON(json) {
    const { Label: name, LastUpdate: details } = json;
    return new Flow(name, details);
  }

  static EMPTY = new Flow();
}
