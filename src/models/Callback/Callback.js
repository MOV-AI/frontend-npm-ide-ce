export default class Callback {
  constructor(name) {
    this.name = name;
    this.url = `global/${this.getScope()}/${this.name}`;
  }

  getScope() {
    return Callback.SCOPE;
  }

  getFileExtension() {
    return ".cb";
  }

  static SCOPE = "Callback";

  static ofJSON(json) {
    return new Callback(json.Label);
  }
}
