export default class Flow {
  constructor(name) {
    this.name = name;
    this.url = `global/${this.getType()}/${this.name}`;
  }

  getType() {
    return Flow.TYPE;
  }

  static TYPE = "Flow";

  static ofJSON(json) {
    return new Flow(json.Label);
  }
}
