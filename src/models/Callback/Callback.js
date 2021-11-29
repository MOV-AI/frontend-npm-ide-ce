export default class Callback {
  constructor(name) {
    this.name = name;
    this.url = `global/${this.getType()}/${this.name}`;
  }

  getType() {
    return Callback.TYPE;
  }

  static TYPE = "Callback";

  static ofJSON(json) {
    return new Callback(json.Label);
  }
}
