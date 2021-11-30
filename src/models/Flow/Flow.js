export default class Flow {
  constructor(name) {
    this.name = name;
    this.url = `global/${this.getScope()}/${this.name}`;
  }

  getScope() {
    return Flow.SCOPE;
  }

  getFileExtension() {
    return ".flo";
  }

  static SCOPE = "Flow";

  static ofJSON(json) {
    return new Flow(json.Label);
  }
}
